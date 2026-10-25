import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/api_client.dart';
import '../state/auth_provider.dart';
import '../widgets/common.dart';
import 'login_screen.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<dynamic> _items = [];
  int _unread = 0;
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

  /// إعادة تحميل الإشعارات عند تسجيل الدخول أو الخروج
  void _onAuthChanged() {
    if (!mounted) return;
    if (context.read<ApiClient>().isAuthenticated) {
      _load();
    } else {
      setState(() {
        _items = [];
        _unread = 0;
      });
    }
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final data = await context.read<ApiClient>().get('/notifications',
          query: {'limit': 100});
      if (!mounted) return;
      setState(() {
        _items = (data is Map && data['items'] != null)
            ? (data['items'] as List)
            : const [];
        _unread = (data is Map ? data['unread'] as num? : null)?.toInt() ?? 0;
      });
    } catch (_) {
      if (mounted) setState(() => _items = []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _markAll() async {
    try {
      await context.read<ApiClient>().patch('/notifications/read-all');
      await _load();
    } catch (_) {
      // صامت
    }
  }

  Future<void> _markOne(String id) async {
    try {
      await context.read<ApiClient>().patch('/notifications/$id/read');
      if (mounted) {
        setState(() {
          _unread = (_unread - 1).clamp(0, _unread);
          _items = _items.map((n) {
            final m = n as Map<String, dynamic>;
            return m['id'] == id ? {...m, 'isRead': true} : m;
          }).toList();
        });
      }
    } catch (_) {
      // صامت
    }
  }

  static const _typeIcons = <String, IconData>{
    'NEW_BOOKING': Icons.event_available_rounded,
    'BOOKING_UPDATE': Icons.event_note_rounded,
    'BOOKING_CANCELLED': Icons.event_busy_rounded,
  };

  static const _typeLabels = <String, String>{
    'NEW_BOOKING': 'حجز جديد',
    'BOOKING_UPDATE': 'تحديث حجز',
    'BOOKING_CANCELLED': 'إلغاء حجز',
  };

  String _timeAgo(String? iso) {
    if (iso == null) return '';
    final d = DateTime.tryParse(iso);
    if (d == null) return '';
    final diff = DateTime.now().difference(d);
    if (diff.inMinutes < 1) return 'الآن';
    if (diff.inMinutes < 60) return 'قبل ${diff.inMinutes} دقيقة';
    if (diff.inHours < 24) return 'قبل ${diff.inHours} ساعة';
    if (diff.inDays < 30) return 'قبل ${diff.inDays} يوم';
    return arDate(d);
  }

  @override
  Widget build(BuildContext context) {
    final isAuth = context.watch<AuthProvider>().isLoggedIn;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(_unread > 0 ? 'الإشعارات ($_unread) غير مقروءة' : 'الإشعارات'),
        actions: [
          IconButton(
            onPressed: _load,
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'تحديث',
          ),
          if (isAuth && _unread > 0)
            IconButton(
              onPressed: _markAll,
              icon: const Icon(Icons.done_all_rounded),
              tooltip: 'تعليم الكل كمقروء',
            ),
        ],
      ),
      body: !isAuth
          ? EmptyState(
              icon: Icons.lock_outline,
              title: 'سجّل الدخول لعرض إشعاراتك',
              action: FilledButton(
                onPressed: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                ),
                child: const Text('تسجيل الدخول'),
              ),
            )
          : _loading
              ? ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: 6,
                  itemBuilder: (_, __) => Container(
                    height: 84,
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1A2421) : const Color(0xFFF4F6F4),
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                )
              : _items.isEmpty
                  ? EmptyState(
                      icon: Icons.notifications_off_outlined,
                      title: 'لا توجد إشعارات بعد',
                      subtitle: 'ستظهر هنا تحديثات الحجوزات والعروض الجديدة',
                    )
                  : RefreshIndicator(
                      onRefresh: _load,
                      color: const Color(0xFF0B5D4B),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _items.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, i) {
                          final n = _items.elementAt(i) as Map<String, dynamic>;
                          final type = n['type']?.toString() ?? '';
                          final isRead = n['isRead'] == true;
                          final icon =
                              _typeIcons[type] ?? Icons.notifications_none_rounded;

                          return Material(
                            color: isRead
                                ? (isDark
                                    ? const Color(0xFF141D1A)
                                    : Colors.white)
                                : (isDark
                                    ? const Color(0xFF12221D)
                                    : const Color(0xFFEAF5F1)),
                            borderRadius: BorderRadius.circular(16),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () async {
                                if (!isRead) await _markOne(n['id'].toString());
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(14),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        color: isRead
                                            ? (isDark
                                                ? const Color(0xFF1A2421)
                                                : const Color(0xFFF4F6F4))
                                            : const Color(0xFF0B5D4B).withOpacity(0.14),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Icon(
                                        icon,
                                        size: 22,
                                        color: isRead
                                            ? (isDark
                                                ? Colors.white54
                                                : Colors.black38)
                                            : const Color(0xFF0B5D4B),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Expanded(
                                                child: Text(
                                                  n['title']?.toString() ?? '',
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                  style: TextStyle(
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.w800,
                                                    color: isDark
                                                        ? Colors.white
                                                        : const Color(0xFF1A1A1A),
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              Text(
                                                _timeAgo(
                                                    n['createdAt']?.toString()),
                                                style: TextStyle(
                                                  fontSize: 11,
                                                  color: isDark
                                                      ? Colors.white38
                                                      : Colors.black38,
                                                ),
                                              ),
                                            ],
                                          ),
                                          if (n['body'] != null) ...[
                                            const SizedBox(height: 4),
                                            Text(
                                              n['body'].toString(),
                                              maxLines: 2,
                                              overflow: TextOverflow.ellipsis,
                                              style: TextStyle(
                                                fontSize: 13,
                                                height: 1.5,
                                                color: isDark
                                                    ? Colors.white60
                                                    : const Color(0xFF555555),
                                              ),
                                            ),
                                          ],
                                          if (!isRead) ...[
                                            const SizedBox(height: 6),
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 8, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: const Color(0xFF0B5D4B)
                                                    .withOpacity(0.10),
                                                borderRadius:
                                                    BorderRadius.circular(20),
                                              ),
                                              child: Text(
                                                _typeLabels[type] ?? 'إشعار',
                                                style: const TextStyle(
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.w700,
                                                  color: Color(0xFF0B5D4B),
                                                ),
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
