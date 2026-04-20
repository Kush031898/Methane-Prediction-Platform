
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Dummy prediction logic (replace with ML API later)
app.post('/predict', (req, res) => {
    const { COD, Flow_OLR, C_N_Ratio, Temperature, pH, HRT, Time } = req.body;

    const prediction =
        0.0005 * COD +
        2 * Flow_OLR +
        1.5 * C_N_Ratio +
        3 * Temperature -
        20 * Math.abs(pH - 7) +
        1.2 * HRT +
        0.5 * Time;

    res.json({ methane: prediction });
});

app.listen(5000, () => console.log("Server running on port 5000"));
