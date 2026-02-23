import 'package:flutter/material.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';

class FAQPage extends StatelessWidget {
  const FAQPage({super.key});

  @override
  Widget build(BuildContext context) {
    final faqs = [
      {
        'question': 'What services do you offer?',
        'answer':
            'We provide comprehensive non-legal application support services including: Visa Form Preparation, College & University Application Support, Document Evaluation Application Support, Exam & Licensing Board Application Support, Career Readiness & Job Application Support, and Business License & Related Application Support.',
      },
      {
        'question': 'Do you provide legal or immigration advice?',
        'answer':
            'No, we do not provide legal advice. OneStop Application Services LLC offers non-legal assistance only. We help you complete application forms, organize documents, and navigate procedural requirements.',
      },
      {
        'question': 'How long does the process take?',
        'answer':
            'The timeline varies depending on the type of service. Generally, document preparation and form completion can take 1-2 weeks. However, overall timeline depends on processing times from relevant authorities.',
      },
      {
        'question': 'What documents are needed?',
        'answer':
            'Required documents vary by service. Generally, you\'ll need ID, educational transcripts, professional certificates, and relevant application forms. We\'ll provide a detailed checklist during consultation.',
      },
      {
        'question': 'How much do your services cost?',
        'answer':
            'Pricing varies based on complexity. We require a \$75 deposit to book an appointment, which goes toward your total service fee. We\'ll provide a detailed quote after consultation.',
      },
      {
        'question': 'Can you help with applications outside the US?',
        'answer':
            'Yes! We assist clients worldwide. Our virtual services make it easy to work with us regardless of your location.',
      },
    ];

    return MainScaffold(
      currentIndex: -1,
      title: 'FAQ',
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildFAQHero(context),
            _buildFAQList(context, faqs),
            _buildStillHaveQuestions(context),
          ],
        ),
      ),
    );
  }

  Widget _buildFAQHero(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
            colors: [AppTheme.primaryBlue, AppTheme.secondaryTeal]),
      ),
      child: Column(
        children: [
          Text(
            'Frequently Asked Questions',
            textAlign: TextAlign.center,
            style: TextStyle(
                color: Colors.white,
                fontSize: MediaQuery.of(context).size.width < 380 ? 28 : 32,
                fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 16),
          Text(
            'Find answers to common questions about our services',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white70, fontSize: 18),
          ),
        ],
      ),
    );
  }

  Widget _buildFAQList(BuildContext context, List<Map<String, String>> faqs) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const Text('Got Questions?',
              style: TextStyle(
                  color: AppTheme.secondaryTeal, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('We Have Answers',
              style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryBlue)),
          const SizedBox(height: 32),
          ...faqs.map((faq) => Container(
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey[200]!),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Theme(
                  data: Theme.of(context)
                      .copyWith(dividerColor: Colors.transparent),
                  child: ExpansionTile(
                    title: Text(faq['question']!,
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryBlue)),
                    children: [
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                        child: Text(faq['answer']!,
                            style: const TextStyle(
                                color: AppTheme.textMuted, height: 1.5)),
                      ),
                    ],
                  ),
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildStillHaveQuestions(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(32),
      color: Colors.grey[50],
      child: Column(
        children: [
          const Text('Still Have Questions?',
              style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryBlue)),
          const SizedBox(height: 16),
          const Text(
            'Our team is here to help. Get in touch and we\'ll provide the answers you need.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppTheme.textMuted),
          ),
          const SizedBox(height: 24),
          Wrap(
            alignment: WrapAlignment.center,
            spacing: 16,
            runSpacing: 16,
            children: [
              OutlinedButton(
                onPressed: () => Navigator.pushNamed(context, '/contact'),
                child: const Text('Contact Us'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pushNamed(context, '/appointment'),
                child: const Text('Book Now'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
