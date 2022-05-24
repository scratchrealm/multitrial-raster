import { Slider } from '@material-ui/core';
import React, { FunctionComponent, useCallback, useMemo } from 'react';
import Select from 'react-select';
import { SlicingMode } from './MultiTrialRaster';
import './MultiTrialRasterControls.css';

type MultiTrialRasterControlsProps = {
    mode: SlicingMode
    selectedNeuron: number
    selectedTrial: number
    distinctNeuronIds: number[]
    distinctTrialIds: number[]
    setMode: React.Dispatch<React.SetStateAction<SlicingMode>>
    setSelectedNeuron: React.Dispatch<React.SetStateAction<number>>
    setSelectedTrial: React.Dispatch<React.SetStateAction<number>>
}

const mapNumbersToDropdownOptions = (numbers: number[]) => {
    // Could reinforce sorting here
    return numbers.map(
        number => {return {
            value: number,
            label: `${number}`
        }}
    )
}

const MultiTrialRasterControls: FunctionComponent<MultiTrialRasterControlsProps> = (props: MultiTrialRasterControlsProps) => {
    const { mode, selectedNeuron, selectedTrial, distinctNeuronIds, distinctTrialIds, setMode, setSelectedNeuron, setSelectedTrial } = props

    const handleModeChange = useCallback((changeEvent: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = changeEvent.target.value === 'slicing_by_neuron'
            ? 'slicing_by_neuron'
            : changeEvent.target.value === 'slicing_by_trial'
                ? 'slicing_by_trial'
                : undefined
        newVal && setMode(newVal)
    }, [setMode])

    const handleSelectedNeuronChange = useCallback((newOption: any) => {
        if (distinctNeuronIds.includes(newOption.value)) {
            setSelectedNeuron(newOption.value)
        }
    }, [distinctNeuronIds, setSelectedNeuron])

    const handleSelectedTrialChange = useCallback((newOption: any) => {
        if (distinctTrialIds.includes(newOption.value)) {
            setSelectedTrial(newOption.value)
        }
    }, [distinctTrialIds, setSelectedTrial])

    const handleSelectedNeuronSliderChange = useCallback((evt: any, value: number | number[]) => {
        setSelectedNeuron(distinctNeuronIds[value as any as number])
    }, [setSelectedNeuron, distinctNeuronIds])

    const handleSelectedTrialSliderChange = useCallback((evt: any, value: number | number[]) => {
        setSelectedTrial(distinctTrialIds[value as any as number])
    }, [setSelectedTrial, distinctTrialIds])

    const selectedNeuronIndex = useMemo(() => {
        if (!selectedNeuron) return undefined
        return distinctNeuronIds.find(e => (e ===selectedNeuron))
    }, [distinctNeuronIds, selectedNeuron])

    const selectedTrialIndex = useMemo(() => {
        if (!selectedTrial) return undefined
        return distinctTrialIds.find(e => (e ===selectedTrial))
    }, [distinctTrialIds, selectedTrial])

    const neuronOptions = useMemo(() => mapNumbersToDropdownOptions(distinctNeuronIds), [distinctNeuronIds])
    const trialOptions = useMemo(() => mapNumbersToDropdownOptions(distinctTrialIds), [distinctTrialIds])

    const selectedNeuronOption = neuronOptions.find(n => n.value === selectedNeuron)
    const selectedTrialOption = trialOptions.find(n => n.value === selectedTrial)

    return (
        <div id='controls' className='controls-panel'>
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
                Selected Neuron ID:&nbsp;
                <Slider
                    style={{width: 200, paddingBottom: 6}}
                    min={0}
                    max={distinctNeuronIds.length - 1}
                    value={selectedNeuronIndex}
                    onChange={handleSelectedNeuronSliderChange}
                    disabled={mode !== 'slicing_by_neuron'}
                />
                <Select
                    value={selectedNeuronOption}
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
                Selected Trial ID:&nbsp;
                <Slider
                    style={{width: 200, paddingBottom: 6}}
                    min={0}
                    max={distinctTrialIds.length - 1}
                    value={selectedTrialIndex}
                    onChange={handleSelectedTrialSliderChange}
                    disabled={mode !== 'slicing_by_trial'}
                />
                <Select
                    value={selectedTrialOption}
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