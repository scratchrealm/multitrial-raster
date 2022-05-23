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
                Selected Neuron ID:
                <Select
                    value={selectedNeuronOption}
                    options={neuronOptions}
                    onChange={handleSelectedNeuronChange}
                    classNamePrefix="dropdown"
                    className="dropdown-inline"
                    components={{ IndicatorsContainer: () => null }}
                    menuPlacement="top"
                />
            </span>
            <span className="form-check">
                Selected Trial ID:
                <Select
                    value={selectedTrialOption}
                    options={trialOptions}
                    onChange={handleSelectedTrialChange}
                    classNamePrefix="dropdown"
                    className="dropdown-inline"
                    components={{ IndicatorsContainer: () => null }}
                    menuPlacement="top"
                />
            </span>
        </div>
    )
}

export default MultiTrialRasterControls