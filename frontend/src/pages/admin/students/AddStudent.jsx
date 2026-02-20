import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Check, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { createStudent } from '../../../api/students.api';
import { getClasses } from '../../../api/classes.api';
import { studentSchema } from '../../../utils/validators';

const steps = [
    { number: 1, title: 'Personal Info' },
    { number: 2, title: 'Parent/Guardian' },
    { number: 3, title: 'Class Assignment' },
    { number: 4, title: 'Review & Submit' },
];

const AddStudent = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);

    const { register, handleSubmit, watch, formState: { errors }, trigger, reset } = useForm({
        resolver: zodResolver(studentSchema),
        mode: 'onBlur',
    });

    const { data: classesData } = useQuery({
        queryKey: ['classes'],
        queryFn: getClasses,
    });
    const classes = classesData?.data || [];

    const createMutation = useMutation({
        mutationFn: createStudent,
        onSuccess: () => {
            toast.success('Student created successfully');
            reset();
            navigate('/admin/students');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to create student'),
    });

    const formData = watch();

    const handleNextStep = async () => {
        const fieldsToValidate = {
            1: ['first_name', 'last_name', 'admission_no', 'dob', 'gender'],
            2: ['father_name', 'father_phone', 'mother_name', 'mother_phone'],
            3: ['class_id'],
            4: [],
        }[currentStep];

        const isValid = await trigger(fieldsToValidate);
        if (isValid && currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const onSubmit = (data) => {
        const payload = { ...data };
        if (photoFile) {
            payload.photo = photoFile;
        }
        createMutation.mutate(payload);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Student</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Complete all steps to register a new student</p>
            </div>

            {/* Step Indicator */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    {steps.map((step, idx) => (
                        <div key={step.number} className="flex items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= step.number
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {currentStep > step.number ? <Check size={20} /> : step.number}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Step {step.number}
                                </p>
                                <p className="text-xs text-gray-500">{step.title}</p>
                            </div>

                            {idx < steps.length - 1 && (
                                <div
                                    className={`hidden sm:block w-12 h-1 mx-4 transition-all ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center space-y-4 mb-6">
                            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700 relative group">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <Plus className="mx-auto text-gray-400" size={24} />
                                        <span className="text-xs text-gray-400">Photo</span>
                                    </div>
                                )}
                                <label className="absolute inset-0 cursor-pointer opacity-0" htmlFor="photo-upload" />
                            </div>
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setPhotoFile(file);
                                        const reader = new FileReader();
                                        reader.onloadend = () => setPhotoPreview(reader.result);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <p className="text-xs text-gray-500">Allowed formats: JPG, PNG. Max size 2MB</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    {...register('first_name')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                                {errors.first_name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    {...register('last_name')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                                {errors.last_name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Admission Number *
                                </label>
                                <input
                                    type="text"
                                    {...register('admission_no')}
                                    placeholder="e.g., ADM2024001"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                                {errors.admission_no && (
                                    <p className="text-red-500 text-xs mt-1">{errors.admission_no.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    {...register('dob')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Gender
                                </label>
                                <select
                                    {...register('gender')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Blood Group
                                </label>
                                <select
                                    {...register('blood_group')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Select Blood Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Address
                            </label>
                            <textarea
                                {...register('address')}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                {...register('phone')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                {...register('email')}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Parent/Guardian Info */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Parent/Guardian Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Father's Name
                                </label>
                                <input
                                    type="text"
                                    {...register('father_name')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Father's Phone
                                </label>
                                <input
                                    type="tel"
                                    {...register('father_phone')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                                {errors.father_phone && (
                                    <p className="text-red-500 text-xs mt-1">{errors.father_phone.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Father's Email
                                </label>
                                <input
                                    type="email"
                                    {...register('father_email')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Mother's Name
                                </label>
                                <input
                                    type="text"
                                    {...register('mother_name')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Mother's Phone
                                </label>
                                <input
                                    type="tel"
                                    {...register('mother_phone')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                                {errors.mother_phone && (
                                    <p className="text-red-500 text-xs mt-1">{errors.mother_phone.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Mother's Email
                                </label>
                                <input
                                    type="email"
                                    {...register('mother_email')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Guardian's Name (if different)
                                </label>
                                <input
                                    type="text"
                                    {...register('guardian_name')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Guardian's Phone
                                </label>
                                <input
                                    type="tel"
                                    {...register('guardian_phone')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Class Assignment */}
                {currentStep === 3 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Class Assignment</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Class *
                                </label>
                                <select
                                    {...register('class_id')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} {c.section ? `(${c.section})` : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.class_id && (
                                    <p className="text-red-500 text-xs mt-1">{errors.class_id.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Roll Number
                                </label>
                                <input
                                    type="text"
                                    {...register('roll_no')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Category
                                </label>
                                <select
                                    {...register('category')}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="">Select Category</option>
                                    <option value="General">General</option>
                                    <option value="OBC">OBC</option>
                                    <option value="SC">SC</option>
                                    <option value="ST">ST</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Review & Submit */}
                {currentStep === 4 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Information</h3>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Name</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {formData.first_name} {formData.last_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Admission No</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{formData.admission_no}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Class</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{formData.class_id || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Father's Phone</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{formData.father_phone || '-'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                Please review the information above. Once submitted, the student will be added to your institution. You can edit details later if needed.
                            </p>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={handlePreviousStep}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <ChevronLeft size={18} />
                        Previous
                    </button>

                    {currentStep < 4 ? (
                        <button
                            type="button"
                            onClick={handleNextStep}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-auto"
                        >
                            Next
                            <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 ml-auto"
                        >
                            {createMutation.isPending ? 'Creating...' : 'Create Student'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddStudent;
