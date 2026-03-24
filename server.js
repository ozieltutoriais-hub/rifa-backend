const express = require("express");
const mercadopago = require("mercadopago");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mercadopago.configure({
  access_token: "SEU_ACCESS_TOKEN"
});

// 🔥 CRIAR PIX
app.post("/criar-pix", async (req, res) => {

    const { nome, valor, numero } = req.body;

    try {

        const pagamento = await mercadopago.payment.create({
            transaction_amount: Number(valor),
            description: `Rifa número ${numero}`,
            payment_method_id: "pix",
            payer: {
                email: "comprador@email.com",
                first_name: nome
            }
        });

        res.json({
            id: pagamento.body.id,
            qr_code: pagamento.body.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: pagamento.body.point_of_interaction.transaction_data.qr_code_base64
        });

    } catch (erro) {
        res.status(500).send(erro);
    }

});

// 🔥 WEBHOOK (CONFIRMA AUTOMÁTICO)
app.post("/webhook", async (req, res) => {

    const data = req.body;

    if (data.type === "payment") {

        const payment = await mercadopago.payment.findById(data.data.id);

        if (payment.body.status === "approved") {

            console.log("PAGAMENTO APROVADO:", payment.body.id);

            // 👉 AQUI você vai atualizar o Firebase depois
        }
    }

    res.sendStatus(200);
});

app.listen(3000, () => {
    console.log("Servidor rodando");
});