'use client';

import Lottie from 'react-lottie';
import animationData from '../../../../public/loading-animation-1704877200883.json';

const LoadingAnimation = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return <Lottie options={defaultOptions} width={200} height={200} />;
};

export default LoadingAnimation;
