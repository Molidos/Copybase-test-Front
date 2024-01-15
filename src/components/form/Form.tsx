'use client';

import axios from 'axios';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Bars } from '../bars/Bars';


export const Form = () => {
    const [file, setFile] = useState<File | null>(null);
    const [mrr, setMrr] = useState(null);
    const [chunRate, setChunRate] = useState(null);
    const [months, setMonths] = useState(null)
    const [revenues, setRevenues] = useState(null)

    //Pega os arquivos
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    //Pega todos os ganhos de cada mês
    function extractRevenue(data:any) {
        // Cria um array para armazenar os valores de revenue
        const revenueArray:any = [];

        // Itera sobre cada objeto no array e adiciona o valor de revenue ao array
        data.forEach((item:any) => {
            revenueArray.push(item.revenue);
        });

        return revenueArray;
    }

    //Pega todos os meses de um array de json sem repetição
    function extractUniqueMonths(data: any) {
        // Cria um conjunto (Set) para armazenar os meses únicos
        const uniqueMonths = new Set();

        // Itera sobre cada objeto no array e adiciona os meses ao conjunto
        data.forEach((item:any) => {
            uniqueMonths.add(item.month.trim());
            uniqueMonths.add(item.startMonth.trim());
            uniqueMonths.add(item.endMonth.trim());
        });

        // Converte o conjunto de volta para um array
        const uniqueMonthsArray = Array.from(uniqueMonths);

        // Ordena os meses em ordem alfabética
        uniqueMonthsArray.sort((a:any, b:any) => {
            const monthsOrder = [
                'january', 'february', 'march', 'april', 'may', 'june',
                'july', 'august', 'september', 'october', 'november', 'december'
            ];

            return monthsOrder.indexOf(a.toLowerCase()) - monthsOrder.indexOf(b.toLowerCase());
        });

        return uniqueMonthsArray;
    }

    // Chama a função e imprime os meses únicos
    const getValues = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!file) {
            console.error('Nenhum arquivo selecionado.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const data = new Uint8Array(event.target.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);


                // Removendo espaços extras nas chaves de cada objeto no array
                const arrayTransformado = jsonData.map((objeto: any) => (
                    Object.fromEntries(
                        Object.entries(objeto).map(([key, value]) => [key.trim(), value])
                    )
                ));


                const uniqueMonths = extractUniqueMonths(arrayTransformado);
                setMonths(uniqueMonths)


                const allRevenues = extractRevenue(arrayTransformado)

                setRevenues(allRevenues)

                const formattedData = processData(arrayTransformado);


                axios.post('http://localhost:8800/processar-dados', formattedData)
                    .then(response => {
                        setMrr(response.data.mrr)
                        setChunRate(response.data.churnRate)
                    })
                    .catch(error => {
                        console.error('Erro na solicitação:', error.message);
                    });
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const processData = (rawData: any[]) => {
        // Implemente a lógica de formatação de dados conforme necessário
        // Supondo que rawData seja um array de objetos com as propriedades corretas
        const mrrData = rawData.map(entry => ({ month: entry.month, revenue: entry.revenue }));
        const customerHistory = rawData.map(entry => ({ customerId: entry.customerId, startMonth: entry.startMonth, endMonth: entry.endMonth }));

        return { mrrData, customerHistory };
    };

    return (
        <div className="flex flex-col justify-center items-center h-full w-full md:w-3/5">
            <div className=' h-2/5 flex justify-center text-center flex-col backdrop-blur-sm bg-black/40 p-4 rounded-md'>
                <h2 className=' mb-5 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 text-2xl md:text-5xl font-bold text-white'>Selecione o arquivo .xlsx ou .csv </h2>

                <form
                    onSubmit={getValues}
                    method='post'
                    className='flex flex-col gap-5 items-center'
                >
                    <label className="w-full md:w-2/3 flex mt-4 sm:inline-flex justify-center items-center bg-gradient-to-tr from-pink-500 to-red-400 hover:from-pink-600 hover:to-red-500 active:from-pink-700 active:to-red-600 focus-visible:ring ring-pink-300 text-white font-semibold text-center rounded-md outline-none transition ease-out duration-100 px-5 py-2" htmlFor="btnChooseFile">Selecionar Arquivo {file && <img className='w-7 ml-4' src='imgs/checked.png' />}</label>



                    <input onChange={handleFileChange} className='hidden' type="file" id="btnChooseFile" accept=".xlsx, .csv" />

                    <button className="text-white rounded-full font-extrabold h-10 w-40 flex justify-center items-center bg-violet-500 hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300 ...">
                        Exibir Resultados
                    </button>

                    {mrr && (
                        <>
                            <div className='flex gap-4'>
                                <span className=' text-xs text-white'><strong>MRR</strong>:{mrr}</span>
                                <span className=' text-xs text-white'><strong>Chun Rate:</strong>{chunRate}</span>
                            </div>

                        </>
                    )}
                </form>

            </div>

            <div className=''>
                <Bars x={months} y={revenues} />
            </div>
        </div>
    );
};
