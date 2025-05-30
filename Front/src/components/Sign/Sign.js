import React, { useState } from 'react';
import styles from './Sign.module.css'; 
import SignInForm from './Sign_in_up_component/Sign_in';
import SignUpForm from './Sign_in_up_component/Sign_up';


const AuthContainer = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const handleSignUpClick = () => {
    setIsSignUpMode(true);
  };

  const handleSignInClick = () => {
    setIsSignUpMode(false);
  };

  return (
    <div className={`${styles.container} ${isSignUpMode ? styles['sign-up-mode'] : ''}`}>
      <div className={styles['forms-container']}>
        <div className={styles['signin-signup']}>
          <SignInForm />
          <SignUpForm onSignUpSuccess={handleSignInClick} />
        </div>
      </div>
      <div className={styles['panels-container']}>
        <div className={`${styles.panel} ${styles['left-panel']}`}>
          <div className={styles.content}>
            <button className={`${styles.btn} ${styles.transparent}`} onClick={handleSignUpClick}>
              Sign up
            </button>
          </div>

        </div>
        <div className={`${styles.panel} ${styles['right-panel']}`}>
          <div className={styles.content}>
            
            <button className={`${styles.btn} ${styles.transparent}`} onClick={handleSignInClick}>
              Sign in
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;