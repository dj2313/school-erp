import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const institutionSchema = z.object({
    name: z.string().min(2, 'Institution name must be at least 2 characters'),
    code: z.string().min(2).max(10, 'Code must be 2-10 characters').uppercase(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    type: z.enum(['school', 'college', 'coaching']).default('school'),
    subscription: z.enum(['basic', 'pro', 'enterprise']).default('basic'),
});

export const assignAdminSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone must be at least 10 digits').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const studentSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    admission_no: z.string().min(1, 'Admission number is required'),
    dob: z.string().optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    blood_group: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    father_name: z.string().optional(),
    father_phone: z.string().optional(),
    father_email: z.string().email().optional().or(z.literal('')),
    mother_name: z.string().optional(),
    mother_phone: z.string().optional(),
    mother_email: z.string().email().optional().or(z.literal('')),
    guardian_name: z.string().optional(),
    guardian_phone: z.string().optional(),
    class_id: z.string().optional(),
    roll_no: z.string().optional(),
    category: z.enum(['General', 'OBC', 'SC', 'ST']).optional(),
});

export const staffSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    employee_code: z.string().min(1, 'Employee code is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    designation: z.string().min(1, 'Designation is required'),
    department: z.string().optional(),
    joining_date: z.string().min(1, 'Joining date is required'),
    salary: z.number().positive('Salary must be a positive number'),
    qualification: z.string().optional(),
    bank_account: z.string().optional(),
    bank_ifsc: z.string().optional(),
    address: z.string().optional(),
});

export const feeStructureSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    academic_year: z.string().min(1, 'Academic year is required'),
    total_amount: z.number().positive('Amount must be positive'),
    components: z.array(
        z.object({
            name: z.string().min(1, 'Component name is required'),
            amount: z.number().positive('Amount must be positive'),
        })
    ),
    due_day: z.number().min(1).max(31).optional(),
    late_fee_per_day: z.number().min(0).default(0),
});

export const changePasswordSchema = z
    .object({
        current_password: z.string().min(6, 'Current password is required'),
        new_password: z.string().min(8, 'New password must be at least 8 characters'),
        confirm_password: z.string(),
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: 'Passwords do not match',
        path: ['confirm_password'],
    });

