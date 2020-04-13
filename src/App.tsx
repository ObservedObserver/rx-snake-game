import React, { useState, useEffect, useRef } from 'react';
import { MODES, MODE_SPPED } from './types';
import { fromEvent } from 'rxjs';
import Port from './view/port';
// import

const MODE_LIST = Object.keys(MODE_SPPED);
const App: React.FC = props => {
  const [mode, setMode] = useState<MODES>(MODES.easy);
  const modeRadios = useRef<HTMLInputElement[]>(MODE_LIST.map(() => null));
  useEffect(() => {
    const choosen = fromEvent(modeRadios.current, 'click');
    choosen.subscribe((e) => {
      // @ts-ignore
      setMode(e.target.value)
    })
  }, [])
  return <div>
    {
      MODE_LIST.map((m, mIndex) => <div key={m}>
          <input ref={(ele) => { modeRadios.current[mIndex] = ele; }} type="radio" name="mode" value={m} defaultChecked={m === mode} />
          <label>{m}</label>
        </div>)
    }
    <Port mode={mode} />
  </div>
}

export default App;
