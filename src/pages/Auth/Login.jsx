import { memo, useState } from 'react';
import Authlayout from '../../components/layouts/Authlayout';
import Input from '../../components/layouts/inputs/input';
import { useNavigate, Link } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import { useAuth } from '../../context/AuthContext';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError("");
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Login failed');
    }
  }


  return (
    <Authlayout>
      <div className='lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center'>
        <h3 className='text-xl font-semibold text-black'>Welcome Back</h3>
        <p className='text-xs text-gray-600'> Please login to your account
        </p>

        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({target}) => setEmail(target.value)}
            label="Email Address"
            placeholder="Shakila@example.com"
            type="text"
            />
            <Input
            value={password}
            onChange={({target}) => setPassword(target.value)}
            label="Password"
            placeholder="At least 6 characters"
            type="password"
            />

            {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

            <button type ="submit" className='btn-primary'>
              LOGIN
            </button>

            <p className='text-[13px] text-slate-800 mt-3'>
              Don't have an account?{""}
              <Link className='font-medium text-primary underline' to="/signup">
                Sign Up
              </Link>
            </p>
        </form>
      </div>
    </Authlayout>
  );
}

export default memo(Login);