import Lottie from "lottie-react";
import RefreshAnimationData from "./assets/refresh.json";

export const LoadingSpinner = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        justifyItems: "center",
        position: "relative",
        marginBottom: 20,
      }}
      className="refresh-container"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          justifyItems: "center",
        }}
        className="circle-loader"
      ></div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          justifyItems: "center",
          width: 32,
          height: 32,
          position: "absolute",
          borderRadius: "100%",
        }}
      >
        <Lottie
          loop={true}
          autoplay={true}
          animationData={RefreshAnimationData}
          style={{
            width: "34px",
            height: "34px",
          }}
        />
      </div>
    </div>
  );
};
