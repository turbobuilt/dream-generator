const fs = require('fs');
const wav = require('node-wav');
const { addon: ov } = require('openvino-node');
const path = require('path');
const log = console;

async function main(modelPath, inputWavPath, outputWavPath, device = 'CPU') {
    const core = new ov.Core();
    const model = await core.readModel(modelPath);
    const stateInpNames = model.inputs.map(item => item.anyName).filter(name => name.includes("state"));
    const inpShapes = Object.fromEntries(model.inputs.map(item => [item.anyName, item.shape]));

    log.info(`Loading the model to ${device}`);
    const compiledModel = await core.compileModel(model, device);

    const buffer = fs.readFileSync(inputWavPath);
    const result = wav.decode(buffer);
    if (result.sampleRate !== 16000) {
        throw new Error(`Sample rate of ${result.sampleRate} Hz not supported. Expected 16000 Hz.`);
    }

    const inferRequest = compiledModel.createInferRequest();
    inferRequest.infer();
    const inputSize = model.inputs[0].shape[1]; // Example to get input size, adjust as necessary
    let samplesOut = [];
    let state = null; // Placeholder for model state if applicable

    let lastNotice = Date.now();
    for (let i = 0; i < result.channelData[0].length; i += inputSize) {
        let inputSlice = result.channelData[0].slice(i, i + inputSize);
        if (inputSlice.length < inputSize) {
            // Padding if the last slice is smaller than expected input size
            inputSlice = new Float32Array([...inputSlice, ...new Array(inputSize - inputSlice.length).fill(0)]);
        }
        const inputTensor = new ov.Tensor(ov.element.f32, [1, inputSize], inputSlice);

        var inputs = { "input": inputTensor };
        for (let name of stateInpNames) {
            if (state) {
                inputs[name] = inferRequest.getTensor(name.replace('inp', 'out')).data;
            } else {
                inputs[name] = new Float32Array(inpShapes[name].reduce((a, b) => a * b, 1));
                inputs[name] = new ov.Tensor(ov.element.f32, inpShapes[name], inputs[name]);
            }
        }
        state = inferRequest.infer(inputs);
        samplesOut.push(inferRequest.getTensor("output").data);
        if (Date.now() - lastNotice > 1000) {
            log.info(`progress: ${i}:${result.channelData[0].length}`);
            lastNotice = Date.now();
        }
    }

    // Concatenate output samples
    const outputSamples = new Float32Array(samplesOut.length * inputSize);
    for (let i = 0; i < samplesOut.length; i++) {
        outputSamples.set(samplesOut[i], i * inputSize);
    }

    // Write the output WAV file
    const outputWavData = wav.encode([outputSamples], { sampleRate: 16000, float: true, bitDepth: 32 });
    fs.writeFileSync(outputWavPath, Buffer.from(outputWavData));
    process.exit(0);
}

// const modelPath = `/Users/dev/prg/dreamgenerator.ai/electron/models/noise-suppression-poconet/intel/noise-suppression-poconetlike-0001/FP16/noise-suppression-poconetlike-0001.xml';
const modelPath = path.join(__dirname, "../intel/noise-suppression-poconetlike-0001/FP16/noise-suppression-poconetlike-0001.xml");
const inputWavPath = '/Users/dev/prg/dreamgenerator.ai/electron/models/noise-suppression-poconet/noisy.wav';
const outputWavPath = '/Users/dev/prg/dreamgenerator.ai/electron/models/noise-suppression-poconet/cleaned.wav';
const deviceName = 'CPU';

main(modelPath, inputWavPath, outputWavPath, deviceName).catch(err => {
    console.error('Error processing WAV file:', err);
});