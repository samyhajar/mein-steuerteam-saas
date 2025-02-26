'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AuthenticationFormProps {
  email: string;
  onEmailChange: (email: string) => void;
  password: string;
  onPasswordChange: (password: string) => void;
  confirmPassword?: string;
  onConfirmPasswordChange?: (password: string) => void;
  firstName?: string;
  onFirstNameChange?: (firstName: string) => void;
  lastName?: string;
  onLastNameChange?: (lastName: string) => void;
  phoneNumber?: string;
  onPhoneNumberChange?: (phoneNumber: string) => void;
  companyName?: string;
  onCompanyNameChange?: (companyName: string) => void;
  isSignup?: boolean;
}

export function AuthenticationForm({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  phoneNumber,
  onPhoneNumberChange,
  companyName,
  onCompanyNameChange,
  isSignup = false,
}: AuthenticationFormProps) {
  return (
    <div className={'flex flex-col w-full gap-5'}>
      {isSignup && (
        <>
          <div className="flex gap-4 w-full">
            <div className="flex-1">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => onFirstNameChange?.(e.target.value)}
                placeholder="John"
                className={'mt-2'}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => onLastNameChange?.(e.target.value)}
                placeholder="Doe"
                className={'mt-2'}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => onCompanyNameChange?.(e.target.value)}
              placeholder="Acme Inc."
              className={'mt-2'}
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => onPhoneNumberChange?.(e.target.value)}
              placeholder="+1 123 456 7890"
              className={'mt-2'}
            />
          </div>
        </>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="example@example.com"
          className={'mt-2'}
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className={'mt-2'}
        />
      </div>

      {isSignup && (
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange?.(e.target.value)}
            className={'mt-2'}
          />
        </div>
      )}
    </div>
  );
}
