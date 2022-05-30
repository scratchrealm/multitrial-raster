import { Checkbox, Slider } from '@material-ui/core';
import { max } from 'mathjs';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import Select from 'react-select';
import { SlicingMode } from './MultiTrialRaster';
import './MultiTrialRasterControls.css';

type MultiTrialRasterControlsProps = {
    mode: SlicingMode
    colorMode: number
    selectedNeuron: number
    selectedTrial: number
    distinctNeuronIds: number[]
    distinctTrialIds: number[]
    setMode: React.Dispatch<React.SetStateAction<SlicingMode>>
    setColorMode: React.Dispatch<React.SetStateAction<number>>
    setSelectedNeuron: React.Dispatch<React.SetStateAction<number>>
    setSelectedTrial: React.Dispatch<React.SetStateAction<number>>
}

const mapNumbersToDropdownOptions = (numbers: number[]) => {
    // Could reinforce sorting here
    return numbers.map(
        (number, index) => {return {
            value: index,
            label: `${number}`
        }}
    )
}

const MultiTrialRasterControls: FunctionComponent<MultiTrialRasterControlsProps> = (props: MultiTrialRasterControlsProps) => {
    const { mode, colorMode, selectedNeuron, selectedTrial, distinctNeuronIds, distinctTrialIds, setMode, setColorMode, setSelectedNeuron, setSelectedTrial } = props

    const handleModeChange = useCallback((changeEvent: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = changeEvent.target.value === 'slicing_by_neuron'
            ? 'slicing_by_neuron'
            : changeEvent.target.value === 'slicing_by_trial'
                ? 'slicing_by_trial'
                : undefined
        newVal && setMode(newVal)
    }, [setMode])

    const handleSelectedNeuronChange = useCallback((newOption: any) => {
        setSelectedNeuron(distinctNeuronIds[newOption.value])
    }, [distinctNeuronIds, setSelectedNeuron])

    const handleSelectedTrialChange = useCallback((newOption: any) => {
        setSelectedTrial(distinctTrialIds[newOption.value])
    }, [distinctTrialIds, setSelectedTrial])

    const handleSelectedNeuronSliderChange = useCallback((evt: any, value: number | number[]) => {
        handleSelectedNeuronChange({value})
    }, [handleSelectedNeuronChange])

    const handleSelectedTrialSliderChange = useCallback((evt: any, value: number | number[]) => {
        handleSelectedTrialChange({value})
    }, [handleSelectedTrialChange])

    const selectedNeuronIndex = useMemo(() => {
        return max(distinctNeuronIds.findIndex(e => (e === selectedNeuron)), 0)
    }, [distinctNeuronIds, selectedNeuron])

    const selectedTrialIndex = useMemo(() => {
        return max(distinctTrialIds.findIndex(e => (e === selectedTrial)), 0)
    }, [distinctTrialIds, selectedTrial])

    const neuronOptions = useMemo(() => mapNumbersToDropdownOptions(distinctNeuronIds), [distinctNeuronIds])
    const trialOptions = useMemo(() => mapNumbersToDropdownOptions(distinctTrialIds), [distinctTrialIds])

    return (
        <div id='controls' className='controls-panel'>
            <span className="form-check">
                <Checkbox
                    checked={!(colorMode === 0)}
                    onChange={(e, checked) => setColorMode(checked ? 1 : 0)}
                    inputProps={{ 'aria-label': 'controlled' }}
                />
                Use factor color series
            </span>
            <span className="form-check">
                <label>
                    <input
                        type="radio"
                        name="mode-select"
                        value="slicing_by_neuron"
                        checked={mode === 'slicing_by_neuron'}
                        className="form-check-input"
                        onChange={handleModeChange}
                    />
                    Show Trials vs Time
                </label>
            </span>
            <span className="form-check">
                <span style={{color: mode === 'slicing_by_neuron' ? 'black' : 'gray', paddingRight: 15}}>
                    Selected Neuron ID:
                </span>
                <Slider
                    style={{width: 200, paddingBottom: 6}}
                    min={0}
                    max={distinctNeuronIds.length - 1}
                    value={selectedNeuronIndex}
                    onChange={handleSelectedNeuronSliderChange}
                    disabled={mode !== 'slicing_by_neuron'}
                />
                <Select
                    value={neuronOptions[selectedNeuronIndex]}
                    options={neuronOptions}
                    onChange={handleSelectedNeuronChange}
                    classNamePrefix="dropdown"
                    className="dropdown-inline"
                    components={{ IndicatorsContainer: () => null }}
                    menuPlacement="top"
                    isDisabled={mode !== 'slicing_by_neuron'}
                />
            </span>
            <span className="form-check">
                <label>
                    <input
                        type="radio"
                        name="mode-select"
                        value="slicing_by_trial"
                        checked={mode === 'slicing_by_trial'}
                        className="form-check-input"
                        onChange={handleModeChange}
                    />
                    Show Neurons vs Time
                </label>
            </span>
            <span className="form-check">
                <span style={{color: mode === 'slicing_by_trial' ? 'black' : 'gray', paddingRight: 15}}>
                    Selected Trial ID:
                </span>
                <Slider
                    style={{width: 200, paddingBottom: 6}}
                    min={0}
                    max={distinctTrialIds.length - 1}
                    value={selectedTrialIndex}
                    onChange={handleSelectedTrialSliderChange}
                    disabled={mode !== 'slicing_by_trial'}
                />
                <Select
                    value={trialOptions[selectedTrialIndex]}
                    options={trialOptions}
                    onChange={handleSelectedTrialChange}
                    classNamePrefix="dropdown"
                    className="dropdown-inline"
                    components={{ IndicatorsContainer: () => null }}
                    menuPlacement="top"
                    isDisabled={mode !== 'slicing_by_trial'}
                />
            </span>
        </div>
    )
}

export default MultiTrialRasterControls