/**
 * @file estoque.data.ts
 * @description Dados mockados do estoque de veículos disponíveis.
 * 8 veículos com condição (novo/seminovo), segmento (suv/picape/sedan),
 * especificações técnicas, opcionais e preço sugerido.
 * Imagens definidas como null — exibem placeholder SVG no sistema.
 *
 * Em produção: substituir por chamada GET /api/estoque.
 */

import type { Estoque } from '../types/global.types';

export const ESTOQUE: Estoque[] = [
  { id:'E001', modelo:'Ford Bronco Sport',    versao:'Badlands 2.0 EcoBoost AT6',  ano:'2026', motor:'2.0 EcoBoost 250 cv',   trans:'Automático 6 vel.', cond:'novo',    status:'Disponível', preco:209900, seg:'suv',    cor:'Azul Arizona',    img:null, estq:4, km:null,       ops:['Teto panorâmico','Câmera 360°','Bancos em couro','Apple CarPlay'] },
  { id:'E002', modelo:'Ford Ranger Storm',    versao:'3.0 V6 Diesel 4x4 AT10',     ano:'2026', motor:'3.0 TDCi V6 250 cv',    trans:'Automático 10 vel.',cond:'novo',    status:'Disponível', preco:299900, seg:'picape', cor:'Cinza Magnético',  img:null, estq:2, km:null,       ops:['Pacote Off-Road','SYNC 4','Câmera 360°','Rodas 18"'] },
  { id:'E003', modelo:'Ford Maverick Hybrid', versao:'XLT FWD 2.5 Hybrid',        ano:'2026', motor:'2.5 Hybrid 190 cv',      trans:'CVT',               cond:'novo',    status:'Disponível', preco:189900, seg:'picape', cor:'Azul Stellar',    img:null, estq:2, km:null,       ops:['FordPass Connect','SYNC 4','Bandeja de carga'] },
  { id:'E004', modelo:'Ford Territory Titanium', versao:'1.5 EcoBoost AT7',       ano:'2026', motor:'1.5 EcoBoost 150 cv',    trans:'Automático 7 vel.', cond:'novo',    status:'Reservado',  preco:179900, seg:'suv',    cor:'Branco Platinum', img:null, estq:1, km:null,       ops:['Teto solar','Ambient Light','Driver Assistance Pack'] },
  { id:'E005', modelo:'Ford Ranger XLS',      versao:'2.2 Diesel 4x4 MT6',        ano:'2024', motor:'2.2 TDCi 158 cv',        trans:'Manual 6 vel.',     cond:'novo',    status:'Disponível', preco:219900, seg:'picape', cor:'Vermelho Race Red',img:null, estq:6, km:null, ops:['Controle de tração','Câmera traseira'] },
  { id:'E006', modelo:'Ford Mustang GT',      versao:'5.0 V8 Fastback',            ano:'2024', motor:'5.0 V8 450 cv',          trans:'Manual 6 vel.',     cond:'seminovo', status:'Disponível', preco:389900, seg:'sedan',  cor:'Azul Grabber',    img:null, estq:1, km:'18.400 km', ops:['Pacote Pony','Launch Control','Performance Exhaust'] },
  { id:'E007', modelo:'Ford Bronco Sport',    versao:'Big Bend 2.0 AT6',           ano:'2024', motor:'2.0 EcoBoost 197 cv',   trans:'Automático 6 vel.', cond:'seminovo', status:'Disponível', preco:174900, seg:'suv',    cor:'Área 51 (Verde)', img:null, estq:1, km:'24.800 km', ops:['SYNC 3','Câmera traseira','Sensores de estacionamento'] },
  { id:'E008', modelo:'Ford Territory SE',    versao:'1.5 EcoBoost AT7',           ano:'2023', motor:'1.5 EcoBoost 150 cv',   trans:'Automático 7 vel.', cond:'seminovo', status:'Disponível', preco:149900, seg:'suv',    cor:'Cinza Magnetic',  img:null, estq:1, km:'31.200 km', ops:['SYNC 3','Câmera traseira'] },
];
