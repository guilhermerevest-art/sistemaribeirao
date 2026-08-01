// Re-exporta o LojaClient do /loja pra que possa ser importado
// de fora da pasta /loja (ex: na home /).
// TEMPORARIO: apontando pra versao de bisecção pra isolar #185.
export { default } from '@/app/loja/loja-client-bisect';
