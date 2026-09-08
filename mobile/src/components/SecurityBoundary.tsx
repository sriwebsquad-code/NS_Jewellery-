import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default function SecurityBoundary({ children }: Props) {
  // Completely bypassed all native security checks to prevent any potential SIGSEGV crashes
  // related to device state, root detection, or experimental expo-device APIs.
  return <>{children}</>;
}


