import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const AnimatedCounter = ({ value, prefix = '', suffix = '', duration = 1.2 }) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    spring.set(numericValue);
  }, [numericValue, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplayValue(Math.round(latest).toLocaleString());
    });
    return () => unsubscribe();
  }, [spring]);

  return (
    <span>
      {prefix}{displayValue}{suffix}
    </span>
  );
};

export default AnimatedCounter;
