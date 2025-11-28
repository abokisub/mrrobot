
import { createContext, useEffect, useReducer} from 'react';



import PropTypes from 'prop-types';
// utils
import axios from '../utils/axios';
import { setSession} from '../utils/jwt';




 



// ----------------------------------------------------------------------

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  setting: null,
};
const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  },
  SETTING:(state, action) =>{
    const {setting} = action.payload;
    return {
      ...state,
      setting
    };
  },
  LOGIN: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
  REGISTER: (state, action) => {
    const { user } = action.payload;
    
    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  VERIFY: (state, action) => {
    const { user } = action.payload;
    return {
      ...state,
      isAuthenticated: 'verify',
      user,
    };
  },
  CHECK: (state, action) => {
    const { user } = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
};

const reducer = (state, action) => (handlers[action.type] ? handlers[action.type](state, action) : state);

const AuthContext = createContext({
  ...initialState,
  method: 'jwt',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  verify: () => Promise.resolve(),
});

// ----------------------------------------------------------------------

AuthProvider.propTypes = {
  children: PropTypes.node,
};

function AuthProvider({ children }) {
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken');
        if (accessToken !== 'undefined' && accessToken !== null && accessToken !== ''){
          const response = await axios.get(`/api/account/my-account/${accessToken}`,{
           });
          const  adex = response.data.user
          window.localStorage.setItem('accessToken', accessToken);
          
          if(response.data.status === 'success'){
            dispatch({
              type: 'INITIALIZE',
              payload: {
                isAuthenticated: true,
                user:adex,
              },
            });
          }else if(response.data.status === 'verify'){
            dispatch({
              type: 'INITIALIZE',
              payload: {
                isAuthenticated: 'verify',
                user:adex,
              },
            });
          }else{
            dispatch({
              type: 'INITIALIZE',
              payload: {
                isAuthenticated: false,
                user:adex,
              },
            });
          }
        
        } else {
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
      }
      
      // Fetch settings separately - don't fail if account fetch failed
      try {
        const res = await axios.get(`/api/website/app/setting`);
        dispatch({
          type: 'SETTING',
          payload: {
            setting: res.data,
          },
        });
      } catch (err) {
        // Log error but don't break the app
        console.error('Failed to fetch settings:', err);
        dispatch({
          type: 'SETTING',
          payload: {
            setting: null,
          },
        });
      }
    };
  

    initialize();
  }, []);
  
  const login = async (username, password) => {
    const response = await axios.post('/api/login/verify/user', {
      username,
      password,
  },{
   });
    const  accessToken  = response.data.token;
    if (accessToken) {
      window.localStorage.setItem('accessToken', accessToken);
    }
    const  adex = response.data.user;
    
    if(response.data.status === 'verify'){
      // Store OTP expiration time (60 seconds from now) when OTP is sent
      const expirationTime = new Date(Date.now() + 60000).toISOString();
      localStorage.setItem('otp_expires_at', expirationTime);
      
      dispatch({
        type: 'VERIFY',
        payload: {
          user: adex,
        },
      });
    } else if(response.data.status === 'success'){
      // Clear OTP expiration on successful login
      localStorage.removeItem('otp_expires_at');
      dispatch({
        type: 'LOGIN',
        payload: {
          user: adex,
        },
      });
    } else {
      // Handle error cases
      throw new Error(response.data.message || 'Login failed');
    }
  };

  const register = async (email, password, firstName, lastName, username, phone, ref, pin, gender, state, city, streetAddress) => {
    const response = await axios.post('/api/register', {
      email,
      password,
      firstName,
      lastName,
      username,
      phone,
      ref: ref || null,
      pin,
      gender,
      state,
      city,
      streetAddress
    },{
      });
          const  accessToken  = response.data.token;
          const  adex = response.data.user
          window.localStorage.setItem('accessToken', accessToken);
    if(response.data.status === 'verify'){
     dispatch({
       type: 'VERIFY',
       payload: {
         user:adex,
       },
     });
    }else{
     dispatch({
       type: 'REGISTER',
       payload: {
         user:adex,
       },
     });
    } 
  };
   
  const verify = async (code, email) => {
    try {
      const res = await axios.post('/api/verify/user/accounct', {
        code,
        email
      });
      
      if (res.data.status === 'success') {
        const accessToken = res.data.token || window.localStorage.getItem('accessToken');
        if (accessToken) {
          window.localStorage.setItem('accessToken', accessToken);
        }
        
        dispatch({
          type: 'CHECK',
          payload: {
            user: res.data.user,
          },
        });
      } else {
        throw new Error(res.data.message || 'Verification failed');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Invalid OTP. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      const accessToken = window.localStorage.getItem('accessToken');
      if (accessToken && accessToken !== 'undefined' && accessToken !== null && accessToken !== '') {
        // Call backend logout API to send OTP
        await axios.post('/api/logout/user', {
          id: accessToken
        });
      }
    } catch (error) {
      // Log error but continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage and dispatch logout
      setSession(null);
      window.localStorage.clear('userKey');
      window.localStorage.clear();
      window.localStorage.clear('accessToken');
      dispatch({ type: 'LOGOUT' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'post',
        login,
        logout,
        register,
        verify
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
