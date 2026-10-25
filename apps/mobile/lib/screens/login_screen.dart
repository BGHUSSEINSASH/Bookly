import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../ui/app_colors.dart';
import '../state/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController(text: 'customer@bookly.app');
  final _password = TextEditingController(text: 'Password@123');
  final _name = TextEditingController();
  final _phone = TextEditingController();

  bool _isRegister = false;
  bool _obscure = true;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _name.dispose();
    _phone.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();

    final ok = _isRegister
        ? await auth.register(
            email: _email.text.trim(),
            password: _password.text,
            fullName: _name.text.trim(),
            phone: _phone.text.trim(),
          )
        : await auth.login(_email.text.trim(), _password.text);

    if (!mounted) return;
    if (ok) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تم تسجيل الدخول بنجاح')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(title: Text(_isRegister ? 'حساب جديد' : 'تسجيل الدخول')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_isRegister) ...[
                TextFormField(
                  controller: _name,
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(labelText: 'الاسم الكامل'),
                  validator: (v) =>
                      (v == null || v.trim().length < 2) ? 'أدخل اسمك الكامل' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _phone,
                  keyboardType: TextInputType.phone,
                  textDirection: TextDirection.ltr,
                  decoration: const InputDecoration(labelText: 'رقم الهاتف (اختياري)'),
                ),
                const SizedBox(height: 12),
              ],
              TextFormField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                textDirection: TextDirection.ltr,
                decoration: const InputDecoration(labelText: 'البريد الإلكتروني'),
                validator: (v) =>
                    (v == null || !v.contains('@')) ? 'أدخل بريدًا إلكترونيًا صحيحًا' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _password,
                obscureText: _obscure,
                textDirection: TextDirection.ltr,
                decoration: InputDecoration(
                  labelText: 'كلمة المرور',
                  suffixIcon: IconButton(
                    icon: Icon(_obscure ? Icons.visibility : Icons.visibility_off),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                ),
                validator: (v) => (v == null || v.length < 8)
                    ? 'كلمة المرور 8 أحرف على الأقل'
                    : null,
              ),
              if (auth.error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Text(
                    auth.error!,
                    style: const TextStyle(color: AppColors.danger, fontSize: 13),
                  ),
                ),
              const SizedBox(height: 20),
              FilledButton(
                onPressed: auth.loading ? null : _submit,
                child: Text(
                  auth.loading
                      ? 'جارٍ المعالجة…'
                      : (_isRegister ? 'إنشاء الحساب' : 'دخول'),
                ),
              ),
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: auth.loading
                    ? null
                    : () async {
                        final navigator = Navigator.of(context);
                        final messenger = ScaffoldMessenger.of(context);
                        final ok = await auth.login(
                          'customer@bookly.app',
                          'Password@123',
                        );
                        if (!mounted) return;
                        if (ok) {
                          navigator.pop();
                          messenger.showSnackBar(
                            const SnackBar(
                              content: Text('تم الدخول بالحساب التجريبي'),
                            ),
                          );
                        }
                      },
                icon: const Icon(Icons.bolt, size: 18),
                label: const Text('دخول تجريبي سريع'),
              ),
              TextButton(
                onPressed: () => setState(() => _isRegister = !_isRegister),
                child: Text(
                  _isRegister
                      ? 'لديك حساب؟ سجّل الدخول'
                      : 'ليس لديك حساب؟ أنشئ واحدًا',
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
