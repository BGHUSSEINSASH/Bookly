import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/api_client.dart';
import '../ui/app_button.dart';
import '../ui/app_colors.dart';
import '../ui/app_pill.dart';
import '../ui/app_price.dart';
import '../ui/app_specs.dart';
import '../ui/app_text.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({
    super.key,
    required this.propertyId,
    required this.propertyTitle,
    required this.pricePerNight,
    required this.currency,
    required this.checkIn,
    required this.checkOut,
    required this.guests,
    this.target = 'PROPERTY',
  });

  /// معرّف العقار أو الرحلة حسب target
  final String propertyId;
  final String propertyTitle;
  final num pricePerNight;
  final String currency;
  final DateTime checkIn;
  final DateTime checkOut;
  final int guests;
  final String target;

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  static const _steps = ['التواريخ', 'الضيوف', 'الدفع', 'التأكيد'];

  int _step = 0;
  late DateTime _checkIn;
  late DateTime _checkOut;
  int _guests = 1;
  String _method = 'WALLET';
  String _coupon = '';
  final TextEditingController _couponCtrl = TextEditingController();
  Map<String, dynamic>? _quote;
  bool _loading = true;
  bool _submitting = false;
  String? _error;

  int get _nights => _checkOut.difference(_checkIn).inDays.clamp(1, 365);

  /// قيمة تقديرية أثناء تحميل السعر من الخادم
  num get _fallbackTotal => widget.target == 'TRIP'
      ? widget.pricePerNight * _guests
      : widget.pricePerNight * _nights;

  @override
  void initState() {
    super.initState();
    _checkIn = widget.checkIn;
    _checkOut = widget.checkOut;
    _guests = widget.guests;
    _loadQuote();
  }

  @override
  void dispose() {
    _couponCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadQuote() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final q = await context.read<ApiClient>().post('/bookings/quote', {
        'target': widget.target,
        if (widget.target == 'TRIP')
          'tripId': widget.propertyId
        else
          'propertyId': widget.propertyId,
        'checkIn': _checkIn.toIso8601String(),
        'checkOut': _checkOut.toIso8601String(),
        'guests': _guests,
        if (_coupon.isNotEmpty) 'couponCode': _coupon,
      });
      if (!mounted) return;
      setState(() => _quote = Map<String, dynamic>.from(q));
    } catch (e) {
      if (mounted) setState(() => _error = '$e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final total = (_quote?['total'] as num?) ?? _fallbackTotal;

    return Scaffold(
      appBar: AppBar(title: const Text('إتمام الحجز')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(
          AppSpace.md,
          AppSpace.md,
          AppSpace.md,
          120,
        ),
        children: [
          // ────── الخطوات ──────
          AppStepper(current: _step, steps: _steps),
          const SizedBox(height: AppSpace.lg),

          // ────── الملخص ──────
          Container(
            padding: const EdgeInsets.all(AppSpace.sm),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : Colors.white,
              borderRadius: BorderRadius.circular(AppRadius.md),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.propertyTitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppText.h4.copyWith(fontSize: 15),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(
                      Icons.event_outlined,
                      size: 14,
                      color: AppColors.textSoft,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        '${_date(_checkIn)} ← ${_date(_checkOut)}',
                        style: AppText.bodySmall,
                      ),
                    ),
                    AppPill(
                      label: '$_nights ليلة',
                      tone: AppPillTone.teal,
                      size: 11,
                      dense: true,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpace.lg),

          // ────── الخطوة 1: التواريخ ──────
          if (_step == 0)
            _card(
              isDark,
              'التواريخ',
              Row(
                children: [
                  Expanded(
                    child: _dateBox(
                      isDark,
                      'الدخول',
                      _checkIn,
                      (d) => setState(() {
                        _checkIn = d;
                        if (!_checkOut.isAfter(d)) {
                          _checkOut = d.add(const Duration(days: 1));
                        }
                      }),
                    ),
                  ),
                  const SizedBox(width: AppSpace.xs),
                  Expanded(
                    child: _dateBox(
                      isDark,
                      'الخروج',
                      _checkOut,
                      (d) => setState(() => _checkOut = d),
                    ),
                  ),
                ],
              ),
            ),

          // ────── الخطوة 2: الضيوف ──────
          if (_step == 1)
            _card(
              isDark,
              'عدد الضيوف',
              Row(
                children: [
                  Expanded(
                    child: Text(
                      '$_guests ضيوف',
                      style: AppText.h4.copyWith(fontSize: 14),
                    ),
                  ),
                  AppCounter(
                    value: _guests,
                    min: 1,
                    max: 20,
                    onDecrement: () => setState(() {
                      if (_guests > 1) _guests--;
                    }),
                    onIncrement: () => setState(() {
                      if (_guests < 20) _guests++;
                    }),
                  ),
                ],
              ),
            ),

          // ────── الخطوة 3: الدفع والكوبون ──────
          if (_step == 2) ...[
            _card(
              isDark,
              'طريقة الدفع',
              Column(
                children: [
                  ..._methods.map(
                    (m) => Padding(
                      padding: const EdgeInsets.only(bottom: AppSpace.xs),
                      child: _methodTile(isDark, m),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpace.sm),
            _card(
              isDark,
              'كود الخصم',
              TextField(
                controller: _couponCtrl,
                onSubmitted: (v) {
                  setState(() => _coupon = v.trim());
                  _loadQuote();
                },
                decoration: InputDecoration(
                  hintText: 'WELCOME10',
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.local_offer_outlined, size: 19),
                    onPressed: () {
                      setState(() => _coupon = _couponCtrl.text.trim());
                      _loadQuote();
                    },
                  ),
                ),
              ),
            ),
          ],

          // ────── الخطوة 4: التأكيد ──────
          if (_step == 3) ...[
            Container(
              padding: const EdgeInsets.all(AppSpace.md),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : Colors.white,
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: Column(
                children: [
                  _priceRow(
                    'الإجمالي قبل الخصم',
                    formatAmount(
                      ((_quote?['subtotal'] as num?) ?? _fallbackTotal).round(),
                    ),
                    isDark,
                  ),
                  if ((_quote?['discount'] as num? ?? 0) > 0)
                    _priceRow(
                      'الخصم',
                      '- ${formatAmount(((_quote!['discount'] as num).round()))}',
                      isDark,
                      color: AppColors.forest,
                    ),
                  _priceRow(
                    'رسوم الخدمة',
                    formatAmount(((_quote?['serviceFee'] as num?) ?? 0).round()),
                    isDark,
                  ),
                  const Divider(height: AppSpace.lg),
                  Row(
                    children: [
                      Text('الإجمالي', style: AppText.h3.copyWith(fontSize: 15)),
                      const Spacer(),
                      AppPriceRow(
                        amount: total,
                        currency: widget.currency,
                        size: AppPriceSize.large,
                      ),
                    ],
                  ),
                  if ((_quote?['pointsEarned'] as num? ?? 0) > 0)
                    Padding(
                      padding: const EdgeInsets.only(top: AppSpace.xs),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.stars_rounded,
                            size: 14,
                            color: AppColors.lime,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'تكسب ${(_quote!['pointsEarned'] as num).round()} نقطة مكافأة',
                            style: AppText.label.copyWith(
                              color: isDark
                                  ? AppColors.darkTextSoft
                                  : AppColors.textSoft,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: AppSpace.sm),
            _card(
              isDark,
              'طريقة الدفع المختارة',
              _methodTile(isDark, _methods.firstWhere((m) => m.$1 == _method)),
            ),
          ],

          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: AppSpace.sm),
              child: Container(
                padding: const EdgeInsets.all(AppSpace.sm),
                decoration: BoxDecoration(
                  color: const Color(0xFFFDECEA),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                ),
                child: Text(
                  _error!,
                  style: AppText.bodySmall.copyWith(color: AppColors.danger),
                ),
              ),
            ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: EdgeInsets.fromLTRB(
          AppSpace.md,
          AppSpace.sm,
          AppSpace.md,
          MediaQuery.of(context).padding.bottom + AppSpace.sm,
        ),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : Colors.white,
          border: Border(
            top: BorderSide(
              color: isDark ? AppColors.darkBorder : AppColors.border,
            ),
          ),
        ),
        child: Row(
          children: [
            if (_step > 0) ...[
              Expanded(
                child: AppButton(
                  label: 'السابق',
                  variant: AppButtonVariant.outline,
                  onPressed: () => setState(() => _step--),
                ),
              ),
              const SizedBox(width: AppSpace.sm),
            ],
            Expanded(
              child: _step < 3
                  ? AppButton(
                      label: 'التالي',
                      trailingIcon: Icons.arrow_back_rounded,
                      onPressed: () {
                        final from = _step;
                        if (from == 2) _coupon = _couponCtrl.text.trim();
                        setState(() => _step = from + 1);
                        // إعادة الحساب بعد تغيير الضيوف أو تطبيق الكوبون
                        if (from == 1 || from == 2) _loadQuote();
                      },
                    )
                  : AppButton(
                      label:
                          'ادفع ${formatAmount(total.round())} ${_symbol(widget.currency)}',
                      icon: Icons.lock_outline_rounded,
                      loading: _submitting || _loading,
                      onPressed: _submit,
                    ),
            ),
          ],
        ),
      ),
    );
  }

  static const _methods = [
    ('WALLET', 'محفظة Bookly', Icons.account_balance_wallet_outlined),
    ('VISA', 'فيزا / ماستركارد', Icons.credit_card_rounded),
    ('APPLE_PAY', 'Apple Pay', Icons.phone_iphone_rounded),
    ('ZAIN_CASH', 'زين كاش', Icons.payments_outlined),
    ('CASH_ON_SITE', 'الدفع عند الوصول', Icons.money_outlined),
  ];

  Widget _card(bool isDark, String title, Widget child) {
    return Container(
      padding: const EdgeInsets.all(AppSpace.md),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(title, style: AppText.h4.copyWith(fontSize: 15)),
          const SizedBox(height: AppSpace.sm),
          child,
        ],
      ),
    );
  }

  Widget _dateBox(
    bool isDark,
    String label,
    DateTime value,
    ValueChanged<DateTime> onPick,
  ) {
    return InkWell(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: value,
          firstDate: DateTime.now(),
          lastDate: DateTime.now().add(const Duration(days: 365)),
        );
        if (picked != null) {
          onPick(picked);
          _loadQuote();
        }
      },
      borderRadius: BorderRadius.circular(AppRadius.sm),
      child: Container(
        padding: const EdgeInsets.all(AppSpace.sm),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurfaceAlt : AppColors.mintSoft,
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: AppText.labelFaint),
            const SizedBox(height: 2),
            Text(
              _date(value),
              style: AppText.h4.copyWith(
                fontSize: 13.5,
                color: isDark ? AppColors.darkText : AppColors.text,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _methodTile(bool isDark, (String, String, IconData) m) {
    final active = _method == m.$1;
    return Material(
      color: active
          ? (isDark ? AppColors.darkSurfaceAlt : AppColors.mintSoft)
          : Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadius.sm),
      child: InkWell(
        onTap: () => setState(() => _method = m.$1),
        borderRadius: BorderRadius.circular(AppRadius.sm),
        child: Container(
          padding: const EdgeInsets.all(AppSpace.sm),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.sm),
            border: Border.all(
              color: active
                  ? (isDark ? AppColors.darkForest : AppColors.forest)
                  : (isDark ? AppColors.darkBorder : AppColors.border),
            ),
          ),
          child: Row(
            children: [
              Icon(
                m.$3,
                size: 19,
                color: active
                    ? (isDark ? AppColors.darkForest : AppColors.forest)
                    : (isDark ? AppColors.darkTextSoft : AppColors.textSoft),
              ),
              const SizedBox(width: AppSpace.sm),
              Expanded(
                child: Text(
                  m.$2,
                  style: AppText.h4.copyWith(
                    fontSize: 13.5,
                    color: isDark ? AppColors.darkText : AppColors.text,
                  ),
                ),
              ),
              if (active)
                Icon(
                  Icons.check_circle_rounded,
                  size: 19,
                  color: isDark ? AppColors.darkForest : AppColors.forest,
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _priceRow(
    String label,
    String value,
    bool isDark, {
    Color? color,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Text(
            label,
            style: AppText.bodySmall.copyWith(
              color: isDark ? AppColors.darkTextSoft : AppColors.textSoft,
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: AppText.bodyMedium.copyWith(
              fontSize: 13.5,
              fontWeight: FontWeight.w600,
              color: color ??
                  (isDark ? AppColors.darkText : AppColors.text),
            ),
          ),
        ],
      ),
    );
  }

  String _date(DateTime d) =>
      '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';

  String _symbol(String c) {
    const symbols = {
      'IQD': 'د.ع',
      'SAR': 'ر.س',
      'AED': 'د.إ',
      'KWD': 'د.ك',
      'QAR': 'ر.ق',
      'USD': '\$',
      'EUR': '€',
    };
    return symbols[c] ?? c;
  }

  Future<void> _submit() async {
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final booking = await context.read<ApiClient>().post('/bookings', {
        'target': widget.target,
        if (widget.target == 'TRIP')
          'tripId': widget.propertyId
        else
          'propertyId': widget.propertyId,
        'checkIn': _checkIn.toIso8601String(),
        'checkOut': _checkOut.toIso8601String(),
        'guests': _guests,
        'paymentMethod': _method,
        if (_coupon.isNotEmpty) 'couponCode': _coupon,
      });

      if (!mounted) return;
      await showDialog(
        context: context,
        builder: (ctx) => _SuccessDialog(
          code: booking['code']?.toString() ?? '',
          total: (booking['total'] as num?) ?? 0,
          currency: booking['currency']?.toString() ?? widget.currency,
          status: booking['status']?.toString() ?? 'CONFIRMED',
        ),
      );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = '$e';
          _submitting = false;
        });
      }
    }
  }
}

class _SuccessDialog extends StatelessWidget {
  const _SuccessDialog({
    required this.code,
    required this.total,
    required this.currency,
    required this.status,
  });

  final String code;
  final num total;
  final String currency;
  final String status;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(AppSpace.lg),
      child: Container(
        padding: const EdgeInsets.all(AppSpace.lg),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.xl),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: 1),
              duration: AppMotion.hero,
              curve: AppMotion.emphasizedCurve,
              builder: (_, v, child) => Transform.scale(scale: v, child: child),
              child: Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(
                  color: AppColors.mint,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_rounded,
                  size: 34,
                  color: AppColors.forest,
                ),
              ),
            ),
            const SizedBox(height: AppSpace.md),
            Text('تم تأكيد الحجز', style: AppText.h2),
            const SizedBox(height: AppSpace.xs),
            Text('رقم الحجز: $code', style: AppText.bodySmall),
            const SizedBox(height: AppSpace.md),
            Container(
              padding: const EdgeInsets.all(AppSpace.sm),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurfaceAlt : AppColors.mintSoft,
                borderRadius: BorderRadius.circular(AppRadius.md),
              ),
              child: Row(
                children: [
                  Text('المبلغ المدفوع', style: AppText.bodySmall),
                  const Spacer(),
                  AppPriceRow(
                    amount: total,
                    currency: currency,
                    size: AppPriceSize.medium,
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpace.md),
            AppButton(
              label: 'حسنًا',
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }
}
