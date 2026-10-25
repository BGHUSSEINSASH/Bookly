import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/api_client.dart';
import '../core/format.dart';
import '../ui/app_colors.dart';
import '../state/auth_provider.dart';
import '../widgets/common.dart';
import 'login_screen.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  Map<String, dynamic>? _wallet;
  List<Map<String, dynamic>> _txns = [];
  Map<String, dynamic>? _loyalty;
  bool _loading = true;
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

  /// إعادة تحميل المحفظة عند تغيّر حالة المصادقة
  void _onAuthChanged() {
    if (mounted) _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final api = context.read<ApiClient>();
      final results = await Future.wait([
        api.get('/wallet'),
        api.get('/wallet/transactions', query: {'limit': 30}),
        api.get('/loyalty/me'),
      ]);
      if (!mounted) return;
      setState(() {
        _wallet = Map<String, dynamic>.from(results[0] as Map);
        _txns = (results[1] is Map && (results[1] as Map)['items'] != null)
            ? ((results[1] as Map)['items'] as List).cast<Map<String, dynamic>>()
            : (results[1] as List).cast<Map<String, dynamic>>();
        _loyalty = Map<String, dynamic>.from(results[2] as Map);
      });
    } catch (_) {
      if (mounted) setState(() => _wallet = null);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _topUp() async {
    final api = context.read<ApiClient>();
    final controller = TextEditingController(text: '50000');
    final amount = await showDialog<int>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('شحن الرصيد'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'المبلغ (د.ع)'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, int.tryParse(controller.text) ?? 0),
            child: const Text('شحن'),
          ),
        ],
      ),
    );
    if (amount == null || amount <= 0) return;

    try {
      await api.post('/wallet/topup', {
        'amount': amount,
        'method': 'VISA',
      });
      await _load();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم شحن الرصيد (بيئة تجريبية)')),
        );
      }
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
        title: const Text('المحفظة'),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: !isAuth
          ? EmptyState(
              icon: Icons.lock_outline,
              title: 'سجّل الدخول لعرض محفظتك',
              action: FilledButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                ),
                child: const Text('تسجيل الدخول'),
              ),
            )
          : _loading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Container(
                        padding: const EdgeInsets.all(22),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppColors.forest, AppColors.forestDark],
                          ),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'رصيد المحفظة',
                              style: TextStyle(color: Colors.white70, fontSize: 13),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              formatMoney(
                                (_wallet?['balance'] as num?) ?? 0,
                                _wallet?['currency']?.toString() ?? 'IQD',
                              ),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 30,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            const SizedBox(height: 14),
                            OutlinedButton.icon(
                              onPressed: _topUp,
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.white,
                                side: const BorderSide(color: Colors.white54),
                              ),
                              icon: const Icon(Icons.add, size: 18),
                              label: const Text('شحن الرصيد'),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              const Icon(Icons.stars, color: AppColors.star, size: 28),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${(_loyalty?['points'] as num?)?.toStringAsFixed(0) ?? 0} نقطة',
                                      style: const TextStyle(
                                        fontSize: 17,
                                        fontWeight: FontWeight.w900,
                                      ),
                                    ),
                                    Text(
                                      'المستوى: ${_loyalty?['tierLabelAr'] ?? '—'}',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppColors.textSoft,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Text(
                                formatMoney((_loyalty?['redeemValue'] as num?) ?? 0),
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.forest,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      const Text(
                        'سجل العمليات',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                      ),
                      const SizedBox(height: 10),
                      Card(
                        child: _txns.isEmpty
                            ? const Padding(
                                padding: EdgeInsets.all(24),
                                child: Center(
                                  child: Text(
                                    'لا توجد عمليات',
                                    style: TextStyle(color: AppColors.textSoft),
                                  ),
                                ),
                              )
                            : Column(
                                children: _txns
                                    .map(
                                      (t) => ListTile(
                                        leading: CircleAvatar(
                                          backgroundColor:
                                              ((t['amount'] as num?) ?? 0) > 0
                                                  ? AppColors.mint
                                                  : const Color(0xFFFEE2E2),
                                          child: Icon(
                                            ((t['amount'] as num?) ?? 0) > 0
                                                ? Icons.arrow_downward
                                                : Icons.arrow_upward,
                                            size: 18,
                                            color: ((t['amount'] as num?) ?? 0) > 0
                                                ? AppColors.forest
                                                : AppColors.danger,
                                          ),
                                        ),
                                        title: Text(
                                          t['note']?.toString() ?? t['type'].toString(),
                                          style: const TextStyle(fontSize: 13),
                                        ),
                                        subtitle: Text(
                                          arDate(DateTime.tryParse(t['createdAt'].toString())),
                                          style: const TextStyle(fontSize: 11),
                                        ),
                                        trailing: Text(
                                          formatMoney(
                                            (t['amount'] as num?) ?? 0,
                                            t['currency']?.toString() ?? 'IQD',
                                          ),
                                          style: TextStyle(
                                            fontWeight: FontWeight.w800,
                                            color: ((t['amount'] as num?) ?? 0) > 0
                                                ? AppColors.forest
                                                : AppColors.text,
                                          ),
                                        ),
                                      ),
                                    )
                                    .toList(),
                              ),
                      ),
                    ],
                  ),
                ),
    );
  }
}
