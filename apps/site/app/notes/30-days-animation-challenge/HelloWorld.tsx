"use client";
import React from "react";
// import { useState } from "react";
import { motion } from "motion/react";
import Button from '@/app/components/Button/Button'

export default function HelloWorld() {
  const [isEnabled, setIsEnabled] = React.useState(true);

  function handleClick() {
    setIsEnabled(!isEnabled);
  }

  return (
    <>
      <motion.div
        className="bg-amber-300 size-[100px] rounded-full"
        animate={isEnabled ? { scale: 1 } : { scale: 0.5 }}
      ></motion.div>
      <Button onClick={handleClick}>Click here</Button>
    </>
  );
}
