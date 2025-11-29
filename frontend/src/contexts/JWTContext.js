
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
          try {
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
              // If status is not success or verify, but we have a token, keep user logged in
              // Only log out if explicitly told to (status 403 or similar)
              if (response.data.status === 403 || response.status === 403) {
                // Clear invalid token and log out
                window.localStorage.removeItem('accessToken');
                dispatch({
                  type: 'INITIALIZE',
                  payload: {
                    isAuthenticated: false,
                    user: null,
                  },
                });
              } else {
                // Keep user logged in with existing data
                dispatch({
                  type: 'INITIALIZE',
                  payload: {
                    isAuthenticated: true,
                    user: adex || null,
                  },
                });
              }
            }
          } catch (apiError) {
            // If API call fails but we have a token, don't immediately log out
            // Try to preserve session - might be temporary network issue
            console.error('Account API error:', apiError);
            
            const errorStatus = apiError?.response?.status;
            const errorData = apiError?.response?.data;
            
            // Only log out if it's explicitly a token/auth error (403/401) AND message indicates invalid token
            const isAuthError = errorStatus === 403 || errorStatus === 401;
            const isInvalidToken = errorData?.message?.toLowerCase().includes('token') || 
                                  errorData?.message?.toLowerCase().includes('expired') ||
                                  errorData?.message?.toLowerCase().includes('invalid');
            
            if (isAuthError && isInvalidToken) {
              // Clear invalid token and log out
              window.localStorage.removeItem('accessToken');
              dispatch({
                type: 'INITIALIZE',
                payload: {
                  isAuthenticated: false,
                  user: null,
                },
              });
            } else {
              // For other errors (network, 500, origin validation, etc.), keep token and maintain session
              // User might still be valid, just API temporarily unavailable or origin issue
              // Retry the request after a short delay
              setTimeout(async () => {
                try {
                  const retryResponse = await axios.get(`/api/account/my-account/${accessToken}`);
                  if (retryResponse.data && retryResponse.data.status === 'success') {
                    dispatch({
                      type: 'INITIALIZE',
                      payload: {
                        isAuthenticated: true,
                        user: retryResponse.data.user,
                      },
                    });
                  }
                } catch (retryError) {
                  // If retry also fails, keep session but mark as uninitialized
                  // Don't log out - let user continue with cached data
                  console.warn('Retry failed, maintaining session:', retryError);
                }
              }, 1000);
              
              // Keep user logged in with existing state
              dispatch({
                type: 'INITIALIZE',
                payload: {
                  isAuthenticated: true,
                  user: null, // Will be loaded on retry or next successful request
                },
              });
            }
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
          // Only log out on critical errors
          console.error('Initialization error:', err);
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
        // Handle different error statuses
        const errorMsg = res.data.message || 'Verification failed';
        throw new Error(errorMsg);
      }
    } catch (error) {
      // Extract error message from response
      let errorMessage = 'Invalid OTP. Please try again.';
      
      if (error?.response?.data) {
        const responseData = error.response.data;
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Don't show "contact admin" - provide more helpful messages
      if (errorMessage.toLowerCase().includes('contact admin') || 
          errorMessage.toLowerCase().includes('unable to authenticate')) {
        errorMessage = 'Unable to verify OTP. Please check your connection and try again, or request a new OTP.';
      }
      
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
