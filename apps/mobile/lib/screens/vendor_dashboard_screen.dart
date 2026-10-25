import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/auth_state.dart';
import '../core/api_client.dart';
import '../ui/theme.dart';

class VendorDashboardScreen extends StatefulWidget {
  const VendorDashboardScreen({super.key});

  @override
  State<VendorDashboardScreen> createState() => _VendorDashboardScreenState();
}

class _VendorDashboardScreenState extends State<VendorDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tab;
  Map<String, dynamic>? _profile;
  List<dynamic> _bookings = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 2, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final api = context.read<AuthState>().api;
    setState(() { _loading = true; _error = null; });
    try {
      final results = await Future.wait([
        api.get('/vendors/me'),
        api.get('/bookings/vendor'),
      ]);
      setState(() {
        _profile  = results[0] as Map<String, dynamic>;
        _bookings = results[1] is List ? results[1] as List : [];
        _loading  = false;
      });
    } on ApiException catch (e) {
      setState(() { _error = e.message; _loading = false; });
    }
  }

  Future<void> _setBookingStatus(String code, String status) async {
    final api = context.read<AuthState>().api;
    try {
      await api.patch('/bookings/$code/status', {'status': status});
      _load();
    } on ApiException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgBase,
      appBar: AppBar(
        backgroundColor: AppTheme.primary,
        title: const Text('لوحة المزوّد', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: Colors.white),
        bottom: TabBar(
          controller: _tab,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(text: 'الملخص'),
            Tab(text: 'الحجوزات'),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? _buildError()
          : TabBarView(
              controller: _tab,
              children: [_buildSummary(), _buildBookings()],
            ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.store_mall_directory_outlined, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            Text(_error ?? 'خطأ', textAlign: TextAlign.center, style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 24),
            ElevatedButton(onPressed: _load, child: const Text('إعادة المحاولة')),
          ],
        ),
      ),
    );
  }

  Widget _buildSummary() {
    final p      = _profile!;
    final pending   = _bookings.where((b) => b['status'] == 'PENDING').length;
    final confirmed = _bookings.where((b) => b['status'] == 'CONFIRMED').length;
    final revenue   = _bookings
        .where((b) => b['paymentStatus'] == 'PAID')
        .fold<double>(0, (s, b) => s + (double.tryParse(b['total'].toString()) ?? 0));

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _vendorCard(p),
          const SizedBox(height: 16),
          _statsGrid(pending, confirmed, revenue, p),
          const SizedBox(height: 16),
          if (pending > 0)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF8E1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFFECAA)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.notifications_active, color: Color(0xFFF59E0B)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text('لديك $pending حجز بانتظار ردّك',
                        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF92400E))),
                  ),
                  TextButton(
                    onPressed: () => _tab.animateTo(1),
                    child: const Text('عرض', style: TextStyle(color: Color(0xFFF59E0B))),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _vendorCard(Map<String, dynamic> p) {
    final isApproved = p['status'] == 'APPROVED';
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primary, AppTheme.primary.withOpacity(0.8)],
          begin: Alignment.topRight,
          end: Alignment.bottomLeft,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(p['companyName'] ?? '', style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: isApproved ? Colors.green.shade400 : Colors.orange.shade400,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              isApproved ? '✅ حساب معتمد' : '⏳ بانتظار الاعتماد',
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ),
          const SizedBox(height: 8),
          Text('العمولة: ${p['commissionRate']}%',
              style: const TextStyle(color: Colors.white70, fontSize: 13)),
        ],
      ),
    );
  }

  Widget _statsGrid(int pending, int confirmed, double revenue, Map<String, dynamic> p) {
    final count = p['_count'];
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.6,
      children: [
        _statTile('عقاراتي',       '${count?['properties'] ?? 0}', Icons.home, Colors.blue),
        _statTile('حجوزات معلّقة', '$pending',                     Icons.pending, Colors.orange),
        _statTile('حجوزات مؤكّدة', '$confirmed',                   Icons.check_circle, Colors.green),
        _statTile('الإيرادات',     '${revenue.toStringAsFixed(0)} IQD', Icons.account_balance_wallet, AppTheme.primary),
      ],
    );
  }

  Widget _statTile(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: color, size: 22),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
            Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
          ]),
        ],
      ),
    );
  }

  Widget _buildBookings() {
    if (_bookings.isEmpty) {
      return const Center(child: Text('لا توجد حجوزات بعد', style: TextStyle(color: Colors.grey)));
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _bookings.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (_, i) => _bookingCard(_bookings[i]),
      ),
    );
  }

  Widget _bookingCard(dynamic b) {
    final status   = b['status'] as String;
    final isPending = status == 'PENDING';
    final statusColor = {
      'PENDING': Colors.orange, 'CONFIRMED': Colors.blue,
      'COMPLETED': Colors.green, 'CANCELLED': Colors.red, 'DECLINED': Colors.grey,
    }[status] ?? Colors.grey;
    final statusAr = {
      'PENDING': 'معلّق', 'CONFIRMED': 'مؤكّد',
      'COMPLETED': 'مكتمل', 'CANCELLED': 'ملغى', 'DECLINED': 'مرفوض',
    }[status] ?? status;

    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(b['code'] ?? '', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 16, fontFamily: 'monospace')),
                      const SizedBox(height: 4),
                      Text(b['customer']?['fullName'] ?? '', style: const TextStyle(fontWeight: FontWeight.w500)),
                      if (b['customer']?['phone'] != null)
                        Text(b['customer']['phone'], style: const TextStyle(color: Colors.grey, fontSize: 12)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
                      child: Text(statusAr, style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.w600)),
                    ),
                    const SizedBox(height: 6),
                    Text('${double.tryParse(b['total'].toString())?.toStringAsFixed(0) ?? 0} ${b['currency'] ?? 'IQD'}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                const Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                const SizedBox(width: 4),
                Text('${b['checkIn']?.toString().split('T')[0] ?? ''} → ${b['checkOut']?.toString().split('T')[0] ?? ''}',
                    style: const TextStyle(fontSize: 12, color: Colors.grey)),
                const SizedBox(width: 12),
                const Icon(Icons.people, size: 14, color: Colors.grey),
                const SizedBox(width: 4),
                Text('${b['guests']} ضيف', style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
          if (isPending) ...[
            const SizedBox(height: 12),
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _setBookingStatus(b['code'], 'DECLINED'),
                      style: OutlinedButton.styleFrom(foregroundColor: Colors.red, side: const BorderSide(color: Colors.red)),
                      child: const Text('❌ رفض'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => _setBookingStatus(b['code'], 'CONFIRMED'),
                      style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                      child: const Text('✅ قبول', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                ],
              ),
            ),
          ] else
            const SizedBox(height: 16),
        ],
      ),
    );
  }
}
