import { memo, useState } from 'react';
import Authlayout from '../../components/layouts/Authlayout';
import Input from '../../components/layouts/inputs/input';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import ProfilePhotoSelector from '../../components/layouts/inputs/ProfilePhotoSelector';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const [profilePic, setProfilepic] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) return setError('Please enter your full name.');
    if (!validateEmail(email)) return setError('Please enter a valid email address.');
    if (!password || password.length < 6) return setError('Password must be at least 6 characters.');

    setError('');
    try {
      await signup({ fullName, email, password });
      navigate('/dashboard');
    } catch (err) {
      if (err?.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        // Handle validation errors
        const errorMessages = err.response.data.errors.map(error => 
          `${error.field}: ${error.message}`
        ).join(', ');
        setError(errorMessages);
      } else {
        setError(err?.response?.data?.message || err?.response?.data?.error || 'Signup failed');
      }
    }
  }

  return (
    <Authlayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
        <h3 className='text-xl font-semibold text-black'>Create Account </h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>
        Join us today by entering your details below.
        </p>

        <form onSubmit={handleSignup}>

        <ProfilePhotoSelector image={profilePic} setImage={setProfilepic} />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              value={fullName}
              onChange={({target}) => setFullName(target.value)}
              label="Full Name"
              placeholder="Your Name"
              type="text"
            />

            <Input
              value={email}
              onChange={({target}) => setEmail(target.value)}
              label="Email Address"
              placeholder="Shakila@example.com"
              type="text"
            />

            <div className='col-span-2'>
            <Input
              value={password}
              onChange={({target}) => setPassword(target.value)}
              label="Password"
              placeholder="At least 6 characters"
              type="password"
            />
            <p className='text-xs text-gray-500 mt-1'>Password must be at least 6 characters long</p>
            </div>
          </div>

          {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

          <button type='submit' className='btn-primary'>
            CREATE ACCOUNT
          </button>
        </form>
      </div>
    </Authlayout>
  );
};

export default memo(Signup);