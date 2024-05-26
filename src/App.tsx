/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import "./App.css";
import PullToRefresh from "react-simple-pull-to-refresh";
const DEFAULT_VALUES = {
  isPullable: true,
  canFetchMore: false,
  fetchMoreThreshold: 100,
  pullDownThreshold: 67,
  maxPullDownDistance: 95,
  resistance: 1,
};
const FAKE_LIST: number[] = [];
for (let i = 0; i < 200; i++) {
  FAKE_LIST.push(i);
}
const App: React.FC = () => {
  // prettier-ignore

  const [list, setList] = useState<number[]>(FAKE_LIST);
  const [isPullable, setIsPullable] = useState<boolean>(
    DEFAULT_VALUES.isPullable
  );
  const [canFetchMore, setCanFetchMore] = useState<boolean>(
    DEFAULT_VALUES.canFetchMore
  );
  const [fetchMoreThreshold, setFetchMoreThreshold] = useState<number>(
    DEFAULT_VALUES.fetchMoreThreshold
  );
  const [pullDownThreshold, setPullDownThreshold] = useState<number>(
    DEFAULT_VALUES.pullDownThreshold
  );
  const [maxPullDownDistance, setMaxPullDownDistance] = useState<number>(
    DEFAULT_VALUES.maxPullDownDistance
  );
  const [resistance, setResistance] = useState<number>(
    DEFAULT_VALUES.resistance
  );

  const handleReset = (): void => {
    setIsPullable(DEFAULT_VALUES.isPullable);
    setCanFetchMore(DEFAULT_VALUES.canFetchMore);
    setFetchMoreThreshold(DEFAULT_VALUES.fetchMoreThreshold);
    setPullDownThreshold(DEFAULT_VALUES.pullDownThreshold);
    setMaxPullDownDistance(DEFAULT_VALUES.maxPullDownDistance);
    setResistance(DEFAULT_VALUES.resistance);
  };

  const getNewData = (): Promise<void> => {
    return new Promise((res) => {
      setTimeout(() => {
        res(setList([...list, ...FAKE_LIST]));
      }, 1500);
    });
  };

  return (
    <div className="App">
      <div className="App-commands" onClick={() => handleReset()}></div>
      <div className="App-ptr">
        <PullToRefresh
          onRefresh={getNewData}
          canFetchMore={canFetchMore}
          isPullable={isPullable}
          onFetchMore={getNewData}
          fetchMoreThreshold={fetchMoreThreshold}
          pullDownThreshold={pullDownThreshold}
          maxPullDownDistance={maxPullDownDistance}
          pullingContent=""
          resistance={resistance}
        >
          <>
            <header className="App-header">
              <h1>Demo App</h1>
              <h2>Pull To Refresh</h2>
            </header>
            <div className="App-container">
              <ul>
                {list.map((item: number, index: number) => (
                  <li key={index}>
                    {index + 1} - {item}
                  </li>
                ))}
              </ul>
            </div>
          </>
        </PullToRefresh>
      </div>
    </div>
  );
};

export default App;
