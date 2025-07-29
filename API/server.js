// /api/server.js
// Este é o nosso servidor proxy. Ele recebe os pedidos do nosso site
// e reencaminha-os para o servidor oficial da SED, contornando as restrições de CORS.

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Habilita o CORS para que o nosso site (frontend) possa comunicar com este servidor.
app.use(cors()); 
app.use(express.json());

// A nossa única rota: /api/proxy
app.post('/api/proxy', async (req, res) => {
    // Extrai os detalhes do pedido que o nosso frontend enviou.
    const { method, url, data, headers } = req.body;

    if (!method || !url) {
        return res.status(400).json({ error: 'Método e URL são necessários.' });
    }

    console.log(`[Proxy] Reencaminhando pedido ${method.toUpperCase()} para: ${url}`);

    try {
        // Usa o axios para fazer o pedido real para o servidor da SED.
        const response = await axios({
            method: method,
            url: url,
            data: data || {},
            headers: headers || {}
        });
        
        // Envia a resposta do servidor da SED de volta para o nosso site.
        res.status(response.status).json(response.data);

    } catch (error) {
        console.error(`[Proxy] Erro ao contactar ${url}:`, error.response?.data || error.message);
        // Se der erro, envia os detalhes do erro de volta para o nosso site.
        res.status(error.response?.status || 500).json({ 
            error: `Falha na comunicação com o servidor externo.`, 
            details: error.response?.data 
        });
    }
});

// Exporta a aplicação para que a Vercel a possa usar.
module.exports = app;

