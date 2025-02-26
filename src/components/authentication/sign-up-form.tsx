'use client';

import { signup } from '@/app/signup/actions';
import { AuthenticationForm } from '@/components/authentication/authentication-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { useState } from 'react';

export function SignupForm() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyName, setCompanyName] = useState('');

  function handleSignup() {
    if (password !== confirmPassword) {
      toast({ description: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    signup({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      companyName,
    }).then((data) => {
      if (data?.error) {
        toast({ description: data.errorMessage || 'Something went wrong. Please try again', variant: 'destructive' });
      }
    });
  }

  return (
    <form action={'#'} className={'px-6 md:px-16 pb-6 py-8 gap-6 flex flex-col items-center justify-center'}>
      <Image src={'/assets/icons/logo/aeroedit-icon.svg'} alt={'AeroEdit'} width={80} height={80} />
      <div className={'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center'}>Create an account</div>
      <AuthenticationForm
        email={email}
        onEmailChange={(email) => setEmail(email)}
        password={password}
        onPasswordChange={(password) => setPassword(password)}
        confirmPassword={confirmPassword}
        onConfirmPasswordChange={(password) => setConfirmPassword(password)}
        firstName={firstName}
        onFirstNameChange={(firstName) => setFirstName(firstName)}
        lastName={lastName}
        onLastNameChange={(lastName) => setLastName(lastName)}
        phoneNumber={phoneNumber}
        onPhoneNumberChange={(phoneNumber) => setPhoneNumber(phoneNumber)}
        companyName={companyName}
        onCompanyNameChange={(companyName) => setCompanyName(companyName)}
        isSignup={true}
      />
      <Button formAction={() => handleSignup()} type={'submit'} variant={'secondary'} className={'w-full'}>
        Sign up
      </Button>
    </form>
  );
}
