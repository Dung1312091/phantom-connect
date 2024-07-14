import { useState } from "react";

const App = () => {
  const [values, setValues] = useState<any>({
    value: 1,
  });
  return (
    <div>
      <div>value: {values.value}</div>
      <button
        onClick={() => {
          setValues(null);
        }}
      >
        Reset value
      </button>
    </div>
  );
};
export default App;
