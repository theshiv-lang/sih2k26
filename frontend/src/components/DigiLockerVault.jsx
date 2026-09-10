import React from 'react';
import CustomDigiLockerVault from './Vault/CustomDigiLockerVault';

/**
 * DigiLockerVault - Replaced with 2D Custom DigiLocker Vault
 * Conforms to technical specifications with full backward compatibility
 */
export default function DigiLockerVault(props) {
  return <CustomDigiLockerVault {...props} />;
}
