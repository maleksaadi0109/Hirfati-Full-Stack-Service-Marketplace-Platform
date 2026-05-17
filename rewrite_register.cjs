const fs = require('fs');
const path = 'c:/Users/LENOVO/Herd/malieek-project/resources/js/pages/auth/register.tsx';
let content = fs.readFileSync(path, 'utf8');

// The new imports: Add axios
if (!content.includes("import axios")) {
    content = content.replace("import React", "import React from 'react';\nimport axios from 'axios';\nimport { router }");
}

// 1. replace the step state and useForm structure
const stateRegex = /const \[step, setStep\] = useState\(1\);[\s\S]*?id_document: null as File \| null,\n {4}\}\);/;

const newFormSetup = `    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, errors, setError, clearErrors } = useForm({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });`;

content = content.replace(stateRegex, newFormSetup);

// 2. replace the submit handlers
const submitRegex = /const validateStep1 = \(\) => \{[\s\S]*?const submit: FormEventHandler = \(e\) => \{[\s\S]*? {4}\};/;

const newSubmit = `    const validateForm = () => {
        return !!(data.first_name && data.last_name && data.phone && data.password && data.password === data.password_confirmation);
    };

    const submit: React.FormEventHandler = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        setIsLoading(true);
        clearErrors();
        
        try {
            const response = await axios.post('/api/register', {
                first_name: data.first_name,
                last_name: data.last_name,
                phone_number: data.phone,
                email: data.email,
                password: data.password,
                password_confirmation: data.password_confirmation,
            });
            
            // Store the token (if using local storage instead of cookies)
            if (response.data.access_token) {
                localStorage.setItem('auth_token', response.data.access_token);
            }
            
            // Redirect to onboarding page (the "second page for details")
            router.visit(route('onboarding'));
        } catch (error: any) {
            setIsLoading(false);
            if (error.response?.data?.errors) {
                const apiErrors = error.response.data.errors;
                Object.keys(apiErrors).forEach(key => {
                    const fieldName = key === 'phone_number' ? 'phone' : key;
                    setError(fieldName as any, apiErrors[key][0]);
                });
            } else {
                alert('An error occurred during registration. Please try again.');
            }
        }
    };`;

content = content.replace(submitRegex, newSubmit);

// 3. remove steps from the form and update the visual representation
const formRegex = /<motion\.form[\s\S]*?<\/motion\.form>/;

const newFormContent = `                    <motion.form
                        variants={scaleIn}
                        onSubmit={submit}
                        className="space-y-5"
                        style={{
                            rotateX: rotateXSpring,
                            rotateY: rotateYSpring,
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="flex gap-4">
                                {/* First Name Field */}
                                <motion.div className="space-y-2 flex-1" whileHover={{ z: 20 }} style={{ transformStyle: 'preserve-3d' }}>
                                    <Label htmlFor="first_name" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                        <User className="w-4 h-4 text-orange-500" /> First Name
                                    </Label>
                                    <div className="relative group">
                                        <InputWrapper icon={<User />} />
                                        <input id="first_name" name="first_name" value={data.first_name} onChange={e => setData('first_name', e.target.value)} required placeholder="John" className="w-full h-14 pl-12 pr-4 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md outline-none" autoFocus />
                                    </div>
                                    <InputError message={errors.first_name} />
                                </motion.div>

                                {/* Last Name Field */}
                                <motion.div className="space-y-2 flex-1" whileHover={{ z: 20 }} style={{ transformStyle: 'preserve-3d' }}>
                                    <Label htmlFor="last_name" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                        <User className="w-4 h-4 text-orange-500" /> Last Name
                                    </Label>
                                    <div className="relative group">
                                        <InputWrapper icon={<User />} />
                                        <input id="last_name" name="last_name" value={data.last_name} onChange={e => setData('last_name', e.target.value)} required placeholder="Doe" className="w-full h-14 pl-12 pr-4 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md outline-none" />
                                    </div>
                                    <InputError message={errors.last_name} />
                                </motion.div>
                            </div>

                            {/* Phone Number Field */}
                            <motion.div className="space-y-2" whileHover={{ z: 20 }} style={{ transformStyle: 'preserve-3d' }}>
                                <Label htmlFor="phone" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-orange-500" /> Phone Number
                                </Label>
                                <div className="relative group">
                                    <InputWrapper icon={<Phone />} />
                                    <input id="phone" type="tel" name="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} required placeholder="+218 9x xxx xxxx" className="w-full h-14 pl-12 pr-4 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md outline-none" />
                                </div>
                                <InputError message={errors.phone} />
                            </motion.div>

                            {/* Email Field (Optional) */}
                            <motion.div className="space-y-2" whileHover={{ z: 20 }} style={{ transformStyle: 'preserve-3d' }}>
                                <Label htmlFor="email" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-orange-500" /> Email Address (Optional)
                                </Label>
                                <div className="relative group">
                                    <InputWrapper icon={<Mail />} />
                                    <input id="email" type="email" name="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="name@example.com" className="w-full h-14 pl-12 pr-4 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md outline-none" />
                                </div>
                                <InputError message={errors.email} />
                            </motion.div>

                            {/* Password Field */}
                            <motion.div className="space-y-2" whileHover={{ z: 20 }} style={{ transformStyle: 'preserve-3d' }}>
                                <Label htmlFor="password" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-orange-500" /> Password
                                </Label>
                                <div className="relative group">
                                    <InputWrapper icon={<Lock />} />
                                    <input id="password" type={showPassword ? "text" : "password"} name="password" value={data.password} className="w-full h-14 pl-12 pr-12 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md outline-none" onChange={(e) => setData('password', e.target.value)} placeholder="••••••••" required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center z-50 text-slate-400 hover:text-orange-600 transition-colors">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </motion.div>

                            {/* Confirm Password Field */}
                            <motion.div className="space-y-2" whileHover={{ z: 20 }} style={{ transformStyle: 'preserve-3d' }}>
                                <Label htmlFor="password_confirmation" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-orange-500" /> Confirm Password
                                </Label>
                                <div className="relative group">
                                    <InputWrapper icon={<Lock />} />
                                    <input id="password_confirmation" type={showConfirmPassword ? "text" : "password"} name="password_confirmation" value={data.password_confirmation} className="w-full h-14 pl-12 pr-12 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm hover:shadow-md outline-none" onChange={(e) => setData('password_confirmation', e.target.value)} placeholder="••••••••" required />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center z-50 text-slate-400 hover:text-orange-600 transition-colors">
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation || (data.password && data.password !== data.password_confirmation ? 'Passwords do not match' : '')} />
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.02 }} className="pt-4">
                                <Button type="submit" disabled={isLoading || !validateForm()} className="w-full h-14 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg flex items-center justify-center gap-2 group">
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                    Create Account
                                </Button>
                            </motion.div>
                        </motion.div>

                        <div className="relative mt-6 mb-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500 font-semibold">Already have an account?</span>
                            </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Link href={route('login')} className="group relative w-full h-14 flex items-center justify-center border-2 border-slate-200 hover:border-orange-300 text-slate-700 hover:text-orange-600 font-bold rounded-xl transition-all shadow-sm overflow-hidden">
                                <span className="relative z-10 flex items-center gap-2">
                                    Sign In
                                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                </span>
                            </Link>
                        </motion.div>
                    </motion.form>`;

content = content.replace(formRegex, newFormContent);

fs.writeFileSync(path, content, 'utf8');
console.log("update complete");
