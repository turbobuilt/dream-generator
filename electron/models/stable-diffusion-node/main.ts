import { DiffusionPipeline } from '@aislamov/diffusers.js'
import { PNG } from 'pngjs'

const pipe = DiffusionPipeline.fromPretrained('aislamov/stable-diffusion-2-1-base-onnx')
const images = pipe.run({
  prompt: "an astronaut running a horse",
  numInferenceSteps: 30,
})

const data = await images[0].mul(255).round().clipByValue(0, 255).transpose(0, 2, 3, 1)

const p = new PNG({ width: 512, height: 512, inputColorType: 2 })
p.data = Buffer.from(data.data)
p.pack().pipe(fs.createWriteStream('output.png')).on('finish', () => {
  console.log('Image saved as output.png');
})