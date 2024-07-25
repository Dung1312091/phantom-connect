import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    console.log("---", (window as any).Telegram);
    (window as any).Telegram.WebApp.BiometricManager.init((data: any) => {
      console.log("---", data);
    });
    console.log("---", (window as any).Telegram.WebApp.BiometricManager);
  }, []);
  return (
    <div>
      <div>AAAA</div>
    </div>
  );
};
export default App;
