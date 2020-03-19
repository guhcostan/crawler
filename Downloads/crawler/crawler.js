var Crawler = require("crawler");
const { Client } = require('pg');
const connectionString = 'postgres://postgres:postgres@localhost:5432/cnpj_crawler';
const client = new Client({
    connectionString: connectionString
});

client.connect();

var cnpj = 0;

var c = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            // $ is Cheerio by default
            //a lean implementation of core jQuery designed specifically for the server
            c.queue(`https://consultacnpj.com/cnpj/${cnpj}`);
            cnpj++;
            cnpj = cnpj.toString().padStart(14, 0);
            const title = $("title").text();
            if(title !== ' - Consulta CNPJ'){
            client.query('INSERT INTO cnpj_crawler.cnpj.cnpj (cnpj, nomeestabelecimento) VALUES ($1,  $2);', [cnpj, $("title").text()], function (err, result) {
                if (err) {
                    console.log(err);
                }
            });
        }
        }
        done();
    }
});

c.queue('https://consultacnpj.com/cnpj/17082461000153');

