import { FunctionComponent, useMemo } from 'react';
import { validateObject } from '../figurl';

export type MultitrialRasterData = {
    spike_time: number[]
    trial_idx: number[]
    neuron_idx: number[]
}
export const isMultitrialRasterData = (x: any): x is MultitrialRasterData => {
    return validateObject(x, {
        spike_time: () => (true),
        trial_idx: () => (true),
        neuron_idx: () => (true)
    })
}

type Props = {
    data: MultitrialRasterData
    width: number
    height: number
}

type SpikeTrainsByNeuronTrial = {
    [neuronId: number]: {
        [trialId: number]: number[]
    }
}

const MainComponent: FunctionComponent<Props> = ({data}) => {
    const {spike_time, trial_idx, neuron_idx} = data
    const neuronIds = useMemo(() => (
        [...new Set(neuron_idx)].sort((a, b) => (a - b))
    ), [neuron_idx])
    const trialIds = useMemo(() => (
        [...new Set(trial_idx)].sort((a, b) => (a - b))
    ), [trial_idx])
    const spikeTrainsByNeuronTrial = useMemo(() => {
        // initiate structure
        const spikeTrainsByNeuronTrial: SpikeTrainsByNeuronTrial = {}
        for (let neuronId of neuronIds) {
            spikeTrainsByNeuronTrial[neuronId] = {}
            for (let trialId of trialIds) {
                spikeTrainsByNeuronTrial[neuronId][trialId] = []
            }
        }
        // fill in data
        for (let i = 0; i < spike_time.length; i++) {
            spikeTrainsByNeuronTrial[neuron_idx[i]][trial_idx[i]].push(spike_time[i])
        }
        return spikeTrainsByNeuronTrial
    }, [neuronIds, trialIds, neuron_idx, spike_time, trial_idx])
    return (
        <div>
            <h3>Multiscale raster</h3>
            <h3>Some spike trains</h3>
            <hr />
            <p>{spikeTrainsByNeuronTrial[neuronIds[0]][trialIds[0]].join(', ')}</p>
            <hr />
            <p>{spikeTrainsByNeuronTrial[neuronIds[5]][trialIds[3]].join(', ')}</p>
            <hr />
            <p>{spikeTrainsByNeuronTrial[neuronIds[15]][trialIds[12]].join(', ')}</p>
            <hr />
            <p>{spikeTrainsByNeuronTrial[neuronIds[15]][trialIds[13]].join(', ')}</p>
            <hr />
            <p>{spikeTrainsByNeuronTrial[neuronIds[25]][trialIds[120]].join(', ')}</p>
            <h3>Lengths</h3>
            <p>{spike_time.length} {trial_idx.length} {neuron_idx.length}</p>
            <h3>Neuron IDs</h3>
            <p>{neuronIds.join(', ')}</p>
            <h3>Trial IDs</h3>
            <p>{trialIds.join(', ')}</p>
        </div>
    )
}

export default MainComponent