import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:onestop_mobile_app/theme/app_theme.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:onestop_mobile_app/widgets/main_scaffold.dart';
import 'package:url_launcher/url_launcher.dart';

class NewRentalPage extends StatefulWidget {
  const NewRentalPage({super.key});

  @override
  State<NewRentalPage> createState() => _NewRentalPageState();
}

class _NewRentalPageState extends State<NewRentalPage> {
  int _currentStep = 0;
  final _formKey = GlobalKey<FormState>();
  SupabaseClient? _supabase;
  final ImagePicker _picker = ImagePicker();

  // Form Fields
  final _titleController = TextEditingController();
  final _priceController = TextEditingController();
  final _addressController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _contactNameController = TextEditingController();
  final _contactPhoneController = TextEditingController();
  final _contactEmailController = TextEditingController();
  String _propertyType = 'Apartment';
  final List<String> _features = [];
  final List<XFile> _selectedImages = [];
  final List<String> _uploadedUrls = [];

  bool _uploading = false;
  bool _saving = false;

  final List<String> _propertyTypes = [
    "Condo",
    "Town House",
    "Town House – Basement",
    "Single House",
    "Single House – Basement",
    "Apartment",
    "Basement"
  ];

  final List<String> _featuresList = [
    "Fully Furnished",
    "Utility Included",
    "Utility Excluded",
    "Parking",
    "Street Parking",
    "Pet Friendly",
    "Laundry in Unit",
    "Air Conditioning",
    "Dishwasher",
    "Balcony"
  ];

  @override
  void initState() {
    super.initState();
    try {
      _supabase = Supabase.instance.client;
      final user = _supabase!.auth.currentUser;
      if (user != null) {
        _contactNameController.text = user.userMetadata?['full_name'] ?? '';
        _contactEmailController.text = user.email ?? '';
      }
    } catch (e) {
      debugPrint('Supabase not initialized: $e');
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _priceController.dispose();
    _addressController.dispose();
    _descriptionController.dispose();
    _contactNameController.dispose();
    _contactPhoneController.dispose();
    _contactEmailController.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    final List<XFile> images = await _picker.pickMultiImage();
    if (images.isNotEmpty) {
      setState(() {
        _selectedImages.addAll(images);
      });
    }
  }

  Future<void> _uploadImages() async {
    if (_selectedImages.isEmpty) return;
    setState(() => _uploading = true);

    try {
      for (var image in _selectedImages) {
        final fileExt = image.path.split('.').last;
        final fileName = '${DateTime.now().millisecondsSinceEpoch}.$fileExt';
        final bytes = await image.readAsBytes();

        await _supabase!.storage.from('rental-images').uploadBinary(
              fileName,
              bytes,
              fileOptions: FileOptions(contentType: 'image/$fileExt'),
            );

        final publicUrl =
            _supabase!.storage.from('rental-images').getPublicUrl(fileName);
        _uploadedUrls.add(publicUrl);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${_uploadedUrls.length} images uploaded')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error uploading images: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _supabase == null) return;

    // First upload images if not done
    if (_uploadedUrls.isEmpty && _selectedImages.isNotEmpty) {
      await _uploadImages();
    }

    setState(() => _saving = true);
    try {
      final user = _supabase!.auth.currentUser;
      if (user == null) throw 'User not logged in';

      final listingData = {
        'title': _titleController.text,
        'description': _descriptionController.text,
        'address': _addressController.text,
        'property_type': _propertyType,
        'price': double.parse(_priceController.text),
        'contact_name': _contactNameController.text,
        'contact_phone': _contactPhoneController.text,
        'contact_email': _contactEmailController.text,
        'features': _features,
        'images': _uploadedUrls,
        'user_id': user.id,
      };

      // Call Edge Function for Stripe
      final response = await _supabase!.functions.invoke(
        'create-rental-checkout',
        body: {'listingData': listingData},
      );

      final data = response.data;
      if (data != null && data['url'] != null) {
        final url = Uri.parse(data['url']);
        if (await canLaunchUrl(url)) {
          await launchUrl(url);
          if (mounted) Navigator.pushReplacementNamed(context, '/dashboard');
        } else {
          throw 'Could not launch payment URL';
        }
      } else {
        throw data?['error'] ?? 'No checkout URL returned';
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: -1,
      title: 'Post a Rental',
      body: Stepper(
        type: MediaQuery.of(context).size.width < 400
            ? StepperType.vertical
            : StepperType.horizontal,
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 2) {
            setState(() => _currentStep++);
          } else {
            _submit();
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() => _currentStep--);
          } else {
            Navigator.pop(context);
          }
        },
        controlsBuilder: (context, details) {
          return Padding(
            padding: const EdgeInsets.only(top: 32),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed:
                        _saving || _uploading ? null : details.onStepContinue,
                    child: _saving
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white))
                        : Text(_currentStep == 2
                            ? 'Pay & Publish (\$25)'
                            : 'Next'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed:
                        _saving || _uploading ? null : details.onStepCancel,
                    child: const Text('Back'),
                  ),
                ),
              ],
            ),
          );
        },
        steps: [
          Step(
            title: const Text('Details'),
            isActive: _currentStep >= 0,
            state: _currentStep > 0 ? StepState.complete : StepState.indexed,
            content: _buildDetailsStep(),
          ),
          Step(
            title: const Text('Photos'),
            isActive: _currentStep >= 1,
            state: _currentStep > 1 ? StepState.complete : StepState.indexed,
            content: _buildPhotosStep(),
          ),
          Step(
            title: const Text('Review'),
            isActive: _currentStep >= 2,
            content: _buildReviewStep(),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailsStep() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTextField(
              _titleController, 'Listing Title', 'e.g. Spacious 2BR Condo'),
          _buildTextField(_priceController, 'Monthly Price (\$)', '0',
              keyboardType: TextInputType.number),
          _buildTextField(
              _addressController, 'Property Address', 'Full address'),
          const SizedBox(height: 16),
          const Text('Property Type',
              style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            initialValue: _propertyType,
            decoration: const InputDecoration(border: OutlineInputBorder()),
            items: _propertyTypes
                .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                .toList(),
            onChanged: (val) => setState(() => _propertyType = val!),
          ),
          _buildTextField(_descriptionController, 'Description',
              'Describe your property...',
              maxLines: 4),
          const SizedBox(height: 16),
          const Text('Features', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: _featuresList.map((f) {
              final isSelected = _features.contains(f);
              return FilterChip(
                label: Text(f,
                    style: TextStyle(
                        fontSize: 12,
                        color: isSelected ? Colors.white : Colors.black)),
                selected: isSelected,
                onSelected: (val) {
                  setState(() {
                    if (val) {
                      _features.add(f);
                    } else {
                      _features.remove(f);
                    }
                  });
                },
                selectedColor: AppTheme.secondaryTeal,
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          const Text('Contact Information',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          _buildTextField(_contactNameController, 'Name', 'Your name'),
          _buildTextField(
              _contactPhoneController, 'Phone', 'Valid phone number',
              keyboardType: TextInputType.phone),
          _buildTextField(
              _contactEmailController, 'Email', 'Valid email address',
              keyboardType: TextInputType.emailAddress),
        ],
      ),
    );
  }

  Widget _buildPhotosStep() {
    return Column(
      children: [
        InkWell(
          onTap: _pickImages,
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 40),
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                  color: Colors.grey[300]!, style: BorderStyle.solid),
            ),
            child: Column(
              children: [
                const Icon(Icons.cloud_upload_outlined,
                    size: 48, color: Colors.grey),
                const SizedBox(height: 16),
                const Text('Tap to upload photos',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                Text('Up to 10 photos recommended',
                    style: TextStyle(color: Colors.grey[600], fontSize: 12)),
              ],
            ),
          ),
        ),
        if (_selectedImages.isNotEmpty) ...[
          const SizedBox(height: 24),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
            ),
            itemCount: _selectedImages.length,
            itemBuilder: (context, index) {
              return Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.file(File(_selectedImages[index].path),
                        fit: BoxFit.cover,
                        width: double.infinity,
                        height: double.infinity),
                  ),
                  Positioned(
                    top: 4,
                    right: 4,
                    child: InkWell(
                      onTap: () =>
                          setState(() => _selectedImages.removeAt(index)),
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: const BoxDecoration(
                            color: Colors.red, shape: BoxShape.circle),
                        child: const Icon(Icons.close,
                            size: 16, color: Colors.white),
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ],
    );
  }

  Widget _buildReviewStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
              color: AppTheme.primaryBlue.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(_titleController.text,
                  style: const TextStyle(
                      fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(_propertyType,
                      style: const TextStyle(color: AppTheme.textMuted)),
                  Text('\$${_priceController.text}/mo',
                      style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: AppTheme.secondaryTeal)),
                ],
              ),
              const Divider(height: 24),
              Text(_addressController.text,
                  style: const TextStyle(fontSize: 13)),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.1)),
          ),
          child: Column(
            children: [
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Listing Subscription',
                          style: TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 16)),
                      Text('Monthly placement',
                          style: TextStyle(
                              fontSize: 12, color: AppTheme.textMuted)),
                    ],
                  ),
                  Text('\$25.00',
                      style:
                          TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(8)),
                child: Row(
                  children: [
                    Icon(Icons.lock_outline, size: 18, color: Colors.blue[700]),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'This is a recurring monthly subscription. You can cancel anytime.',
                        style: TextStyle(fontSize: 11, color: Colors.blue),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTextField(
      TextEditingController controller, String label, String hint,
      {int maxLines = 1, TextInputType keyboardType = TextInputType.text}) {
    return Padding(
      padding: const EdgeInsets.only(top: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextFormField(
            controller: controller,
            maxLines: maxLines,
            keyboardType: keyboardType,
            decoration: InputDecoration(
                hintText: hint, border: const OutlineInputBorder()),
            validator: (val) =>
                val == null || val.isEmpty ? 'This field is required' : null,
          ),
        ],
      ),
    );
  }
}
