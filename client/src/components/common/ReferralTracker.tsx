import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '@/services/api';

const ReferralTracker = () => {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');

  useEffect(() => {
    if (refCode) {
      // Validate code asynchronously to ensure it's valid
      apiClient.validateReferralCode(refCode)
        .then(({ valid, code }) => {
          if (valid) {
            localStorage.setItem('referralCode', code);
          }
        })
        .catch(() => {
          // Ignore invalid codes
        });
    }
  }, [refCode]);

  return null;
};

export default ReferralTracker;
