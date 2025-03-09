import express from 'express';

const app = express();
const port = 5010;


app.use(express.static('/Users/dev/prg/dreamgenerator.ai/website/build'));
app.use('/assets', express.static('./assets'));

app.listen(port, () => {
    console.log(`Server is running on http://127.0.0.1:${port}`);
});