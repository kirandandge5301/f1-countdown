import { useEffect } from 'react';
import { fetchCurrentSchedule } from '@/services/f1Api';

export default function ApiTest() {
  useEffect(() => {
    fetchCurrentSchedule()
      .then(data => {
        console.log('F1 Schedule:', data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return null;
}
