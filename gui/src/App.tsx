import React, { useEffect, useState } from 'react';
import './App.css';
import { getFigureData, useWindowDimensions } from './figurl';
import MainComponent, { isMultitrialRasterData, MultitrialRasterData } from './MainComponent/MainComponent';


function App() {
  let [data, setData] = useState<MultitrialRasterData>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const {width, height} = useWindowDimensions()

  useEffect(() => {
    getFigureData().then((data: any) => {
      if (!isMultitrialRasterData(data)) {
        setErrorMessage(`Invalid figure data`)
        console.error('Invalid figure data', data)
        return
      }
      setData(data)
    }).catch(err => {
      setErrorMessage(`Error getting figure data`)
      console.error(`Error getting figure data`, err)
    })
  }, [])

  if (errorMessage) {
    return <div style={{color: 'red'}}>{errorMessage}</div>
  }

  if (!data) {
    return <div>Waiting for data</div>
  }

  return (
    <MainComponent
      data={data}
      width={width - 10}  // we don't want the scrollbar to appear even when the menu is opened
      height={height - 5} // we don't want the scrollbar to appear
    />
  )
}

export default App;
