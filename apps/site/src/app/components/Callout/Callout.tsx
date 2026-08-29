import { BsInfoCircle, BsExclamationTriangle } from "react-icons/bs";
import { LuOctagonAlert } from "react-icons/lu";
import { match } from "ts-pattern";

interface CalloutProps {
  children: string;
  mode: "info" | "warning" | "danger";
}

const COLORS = {
  info: {
    main: "#1F6EF9",
    second: "#4a81e83f",
    third: "#206DF8"
  },
  warning: {
    main: "#FFA500",
    second: "#FFA50033",
    third: "#206DF8"
  },
  danger: {
    main: "#DC2626",
    second: "#DC262633",
    third: "#206DF8"
  },
};

export function Callout({ children, mode }: CalloutProps) {
  console.log(mode);

  const color = match(mode)
    .with("info", () => COLORS.info)
    .with("warning", () => COLORS.warning)
    .otherwise(() => COLORS.danger);

  return (
    <>
      <div
        style={{
          backgroundColor: color.second,
          borderColor: color.main,
          borderRadius: "10px",
          boxShadow: "inset 0 0 0 2px #000",
        }}
        className="border-l-4 py-2 px-8 rounded-sm relative rounded-tl-2xl mt-8 mb-10"
      >
        {/* <div
          style={{
            width: "40px",
            height: "40px",
            left: "-16px",
            top: "-16px",
            backgroundColor: color.main,
          }}
          className="rounded-full absolute border-4 border-white flex justify-center items-center"
        >
          {mode === "info" ? (
            <BsInfoCircle color="white" />
          ) : mode === "danger" ? (
            <BsExclamationTriangle color="white" />
          ) : (
            <LuOctagonAlert color="white" />
          )}
        </div> */}
        <p className="m-0">{children}</p>
      </div>
    </>
  );
}
