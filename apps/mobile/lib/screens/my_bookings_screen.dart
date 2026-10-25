import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/api_client.dart';
import '../core/format.dart';
import '../ui/app_colors.dart';
import '../ui/app_text.dart';
import '../state/auth_provider.dart';
import '../widgets/common.dart';
import 'login_screen.dart';

class MyBookingsScreen extends StatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  State<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen> {
  List<Map<String, dynamic>> _bookings = [];
  bool _loading = true;
  String _status = 'ALL';
  late final AuthProvider _auth;

  @override
  void initState() {
    super.initState();
    _auth = context.read<AuthProvider>();
    _auth.addListener(_onAuthChanged);
    _load();
  }

  @override
  void dispose() {
    _auth.removeListener(_onAuthChanged);
    super.dispose();
  }

  /// إعادة تحميل الحجز عند تغيّر حالة المصادقة
  void _onAuthChanged() {
    if (mounted) _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await context.read<ApiClient>().get('/bookings', query: {
        'status': _status,
        'limit': 50,
      });
      if (!mounted) return;
      final items = (data is Map && data['items'] != null)
          ? (data['items'] as List)
          : (data as List);
      setState(() => _bookings = items.cast<Map<String, dynamic>>());
    } catch (_) {
      if (mounted) setState(() => _bookings = []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _cancel(String code) async {
    final api = context.read<ApiClient>();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('إلغاء الحجز'),
        content: const Text('هل تريد إلغاء هذا الحجز؟ سيتم استرداد المبلغ حسب سياسة الاسترداد.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('تراجع')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
            child: const Text('إلغاء الحجز'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      await api.post('/bookings/$code/cancel', {
        'reason': 'إلغاء من التطبيق',
      });
      await _load();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isAuth = context.watch<AuthProvider>().isLoggedIn;

    return Scaffold(
      appBar: AppBar(
        title: const Text('حجوزاتي'),
        actions: [
          IconButton(
            onPressed: _load,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: !isAuth
          ? EmptyState(
              icon: Icons.lock_outline,
              title: 'سجّل الدخول لعرض حجوزاتك',
              action: FilledButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                ),
                child: const Text('تسجيل الدخول'),
              ),
            )
          : Column(
              children: [
                SizedBox(
                  height: 46,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    children: [
                      _chip('الكل', 'ALL'),
                      _chip('مؤكد', 'CONFIRMED'),
                      _chip('قيد الانتظار', 'PENDING'),
                      _chip('مكتمل', 'COMPLETED'),
                      _chip('ملغى', 'CANCELLED'),
                    ],
                  ),
                ),
                if (_loading) const LinearProgressIndicator(minHeight: 2),
                Expanded(
                  child: _bookings.isEmpty && !_loading
                      ? const EmptyState(
                          icon: Icons.confirmation_number_outlined,
                          title: 'لا توجد حجوزات',
                          subtitle: 'ابدأ باستكشاف المزارع والفنادق',
                        )
                      : RefreshIndicator(
                          onRefresh: _load,
                          child: ListView.separated(
                            padding: const EdgeInsets.all(16),
                            itemCount: _bookings.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 10),
                            itemBuilder: (_, i) => _bookingCard(_bookings[i]),
                          ),
                        ),
                ),
              ],
            ),
    );
  }

  Widget _chip(String label, String value) {
    final active = _status == value;
    return Padding(
      padding: const EdgeInsets.only(left: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: active,
        selectedColor: AppColors.forest,
        labelStyle: TextStyle(
          fontSize: 12,
          color: active ? Colors.white : AppColors.textSoft,
        ),
        onSelected: (_) {
          setState(() => _status = value);
          _load();
        },
      ),
    );
  }

  Widget _bookingCard(Map<String, dynamic> b) {
    final status = b['status']?.toString() ?? '';
    final property = b['property'] as Map<String, dynamic>?;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.mint,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    AppLabels.bookingStatus[status] ?? status,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppColors.forestDark,
                    ),
                  ),
                ),
                const Spacer(),
                Text(
                  '#${b['code']}',
                  style: const TextStyle(fontSize: 11, color: AppColors.textFaint),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              property?['title']?.toString() ?? 'حجز',
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            InfoRow(
              icon: Icons.event,
              text: '${arDate(DateTime.tryParse(b['checkIn'].toString()))} ← ${arDate(DateTime.tryParse(b['checkOut'].toString()))}',
            ),
            const SizedBox(height: 4),
            InfoRow(icon: Icons.people_outline, text: '${b['guests']} ضيوف'),
            const Divider(height: 22),
            Row(
              children: [
                Text(
                  formatMoney((b['total'] as num?) ?? 0, b['currency']?.toString() ?? 'IQD'),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: AppColors.forest,
                  ),
                ),
                const Spacer(),
                if (status == 'PENDING' || status == 'CONFIRMED')
                  OutlinedButton(
                    onPressed: () => _cancel(b['code'].toString()),
                    style: OutlinedButton.styleFrom(foregroundColor: AppColors.danger),
                    child: const Text('إلغاء', style: TextStyle(fontSize: 12)),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
