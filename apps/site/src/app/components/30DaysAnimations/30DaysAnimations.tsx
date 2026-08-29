"use client";

import React from "react";
import { motion } from "motion/react";
import Button from "@/app/components/Button/Button";
import { div } from "motion/react-client";

export function Ball() {
  const [isEnabled, setIsEnabled] = React.useState(true);

  function handleClick() {
    setIsEnabled(!isEnabled);
  }

  return (
    <>
      <motion.div
        className="bg-amber-300 size-[100px] rounded-full mb-4"
        animate={isEnabled ? { scale: 1 } : { scale: 0.5 }}
      ></motion.div>
      <Button onClick={handleClick}>Click here</Button>
    </>
  );
}

export function Square() {
  const [key, setKey] = React.useState(true)

  return (
    <motion.div
      onClick={() => {
        setKey(!key)
      }}
      key={key.toString()}
      style={{
        width: 150,
        height: 150,
        background: 'black'
      }}
      initial={{
        rotate: '0deg',
        x: 0
      }}
      animate={{
        rotate: '180deg',
        x: [0, 500, 0, 75, 0, 200, 0]
      }}
      transition={{
        duration: 5,
        ease: 'backOut',
        times: [0.4, 0.98, 0.4, 0.4, 0.4],
      }}
    ></motion.div>
  )
}
