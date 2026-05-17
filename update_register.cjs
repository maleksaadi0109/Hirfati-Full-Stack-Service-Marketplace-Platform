const fs = require('fs');
const path = 'c:/Users/LENOVO/Herd/malieek-project/resources/js/pages/auth/register.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update imports
content = content.replace(
    "import { Loader2, ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Shield, Users, Star, Award, CheckCircle, TrendingUp, Zap, User } from 'lucide-react';",
    "import { Loader2, ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Shield, Users, Star, Award, CheckCircle, TrendingUp, Zap, User, Phone, MapPin, Briefcase, Upload, ChevronRight, Check } from 'lucide-react';"
);

// Update Register component state and form
const newFormSetup = `export default function Register() {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        city: '',
        category: '',
        experience: '',
        id_document: null as File | null,
    });`;

content = content.replace(/export default function Register\(\) \{[\s\S]*?password_confirmation: '',\n {4}\}\);/, newFormSetup);

const newSubmit = `    const validateStep1 = () => {
        return !!(data.first_name && data.last_name && data.phone && data.password && data.password === data.password_confirmation);
    };

    const nextStep = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && data.role) {
            setStep(3);
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (step !== 3) return;
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };`;

content = content.replace(/ {4}const submit: FormEventHandler = \(e\) => \{[\s\S]*? {4}\};/, newSubmit);

console.log("Replaced form setup and submit handlers.");

const newFormContent = `                    {/* Enhanced Form with 3D effect */}
                    <motion.form
                        variants={scaleIn}
                        onSubmit={submit}
                        className="space-y-5"
                        style={{
                            rotateX: rotateXSpring,
                            rotateY: rotateYSpring,
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        {step === 1 && (
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
                                        <InputError message={errors.first_name || (data.first_name === '' && step > 1 ? 'First name is required' : '')} />
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
                                    <Button type="button" onClick={nextStep} disabled={!validateStep1()} className="w-full h-14 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg group">
                                        Continue <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-800 text-center mb-6">Why are you joining Hirfati?</h3>
                                
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Role Card 1: Customer */}
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => { setData('role', 'customer'); setStep(3); }}
                                        className={\`relative p-6 rounded-2xl border-2 transition-all \${data.role === 'customer' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-300 bg-white'}\`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={\`w-14 h-14 rounded-full flex items-center justify-center \${data.role === 'customer' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}\`}>
                                                <Users className="w-7 h-7" />
                                            </div>
                                            <div className="text-left flex-1">
                                                <h4 className="text-lg font-bold text-slate-900">I am looking for a service</h4>
                                                <p className="text-sm text-slate-500 mt-1">Hire top-rated local professionals safely and easily.</p>
                                            </div>
                                            {data.role === 'customer' && <CheckCircle className="w-6 h-6 text-orange-500 absolute top-4 right-4" />}
                                        </div>
                                    </motion.button>

                                    {/* Role Card 2: Provider */}
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => { setData('role', 'provider'); setStep(3); }}
                                        className={\`relative p-6 rounded-2xl border-2 transition-all \${data.role === 'provider' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300 bg-white'}\`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={\`w-14 h-14 rounded-full flex items-center justify-center \${data.role === 'provider' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}\`}>
                                                <Briefcase className="w-7 h-7" />
                                            </div>
                                            <div className="text-left flex-1">
                                                <h4 className="text-lg font-bold text-slate-900">I want to offer my services</h4>
                                                <p className="text-sm text-slate-500 mt-1">Join as a provider to connect with clients and grow your business.</p>
                                            </div>
                                            {data.role === 'provider' && <CheckCircle className="w-6 h-6 text-blue-500 absolute top-4 right-4" />}
                                        </div>
                                    </motion.button>
                                </div>

                                <button type="button" onClick={prevStep} className="text-slate-500 hover:text-slate-800 text-sm font-semibold flex items-center mt-6 w-full justify-center">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                {data.role === 'customer' ? (
                                    <>
                                        {/* Customer Fields */}
                                        <motion.div className="space-y-2" whileHover={{ z: 20 }}>
                                            <Label htmlFor="city" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-orange-500" /> City / Neighborhood
                                            </Label>
                                            <div className="relative group">
                                                <InputWrapper icon={<MapPin />} />
                                                <input id="city" type="text" name="city" value={data.city} onChange={e => setData('city', e.target.value)} required placeholder="e.g. Tripoli, Hay Al Andalus" className="w-full h-14 pl-12 pr-4 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm outline-none" />
                                            </div>
                                            <InputError message={errors.city} />
                                        </motion.div>
                                    </>
                                ) : (
                                    <>
                                        {/* Provider Fields */}
                                        <motion.div className="space-y-2" whileHover={{ z: 20 }}>
                                            <Label htmlFor="category" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-orange-500" /> Service Category
                                            </Label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                                    <Briefcase className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <select id="category" name="category" value={data.category} onChange={e => setData('category', e.target.value)} required className="w-full h-14 pl-12 pr-4 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl bg-white transition-all text-slate-900 font-medium shadow-sm outline-none appearance-none">
                                                    <option value="" disabled>Select your service</option>
                                                    <option value="Plumbing">Plumbing</option>
                                                    <option value="Electricity">Electricity</option>
                                                    <option value="Cleaning">Cleaning</option>
                                                    <option value="Carpentry">Carpentry</option>
                                                    <option value="Painting">Painting</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <InputError message={errors.category} />
                                        </motion.div>

                                        <motion.div className="space-y-2" whileHover={{ z: 20 }}>
                                            <Label htmlFor="experience" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                                <Award className="w-4 h-4 text-orange-500" /> Years of Experience
                                            </Label>
                                            <div className="relative group">
                                                <InputWrapper icon={<Award />} />
                                                <input id="experience" type="number" min="0" name="experience" value={data.experience} onChange={e => setData('experience', e.target.value)} required placeholder="e.g. 5" className="w-full h-14 pl-12 pr-4 border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm outline-none" />
                                            </div>
                                            <InputError message={errors.experience} />
                                        </motion.div>

                                        <motion.div className="space-y-2" whileHover={{ z: 20 }}>
                                            <Label htmlFor="id_document" className="text-slate-700 font-bold text-sm flex items-center gap-2">
                                                <Upload className="w-4 h-4 text-orange-500" /> Verification Upload (ID or Certificate)
                                            </Label>
                                            <div className="relative group">
                                                <input id="id_document" type="file" onChange={e => setData('id_document', e.target.files ? e.target.files[0] : null)} className="w-full h-14 p-3 border-2 border-slate-200 focus:border-orange-500 rounded-xl bg-white transition-all text-slate-600 font-medium shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100" />
                                            </div>
                                            <InputError message={errors.id_document} />
                                        </motion.div>
                                    </>
                                )}

                                <motion.div whileHover={{ scale: 1.02 }} className="pt-4 flex gap-3">
                                    <Button type="button" onClick={prevStep} variant="outline" className="h-14 px-6 border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50">
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={processing} className="flex-1 h-14 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg flex items-center justify-center gap-2">
                                        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                        {data.role === 'customer' ? 'Create Account' : 'Submit Application'}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <>
                                <div className="relative mt-6 mb-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-slate-500 font-semibold">Already have an account?</span>
                                    </div>
                                </div>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Link href={route('login')} className="group relative w-full h-14 flex items-center justify-center border-2 border-slate-200 hover:border-orange-300 text-slate-700 hover:text-orange-600 font-bold rounded-xl transition-all shadow-sm shadow-sm overflow-hidden">
                                        <span className="relative z-10 flex items-center gap-2">
                                            Sign In
                                            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                        </span>
                                    </Link>
                                </motion.div>
                            </>
                        )}
                    </motion.form>
`;

// Helper component for inputs
const inputWrapperDefinition = `
import React from 'react';
const InputWrapper = ({ icon }: { icon: React.ReactNode }) => (
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
            {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" })}
        </motion.div>
    </div>
);
`;

content = content.replace(/export default function Register\(\) \{/, inputWrapperDefinition + '\nexport default function Register() {');

// Because of newlines, finding the block to replace needs to be robust:
const startIndex = content.indexOf('{/* Enhanced Form with 3D effect */}');
const endIndex = content.indexOf('</motion.form>') + '</motion.form>'.length;

if (startIndex !== -1 && endIndex !== -1) {
    content = content.slice(0, startIndex) + newFormContent + content.slice(endIndex);
    fs.writeFileSync(path, content);
    console.log("Successfully rebuilt register.tsx");
} else {
    console.log("Could not find the form to replace!");
}
