/* eslint-disable max-len */
export class RegExPatterns {
    static decimalNumberPattern = /^(\d)*[.]?\d*$/;
    static integerNumberPattern = /^(\d)*$/;
    static rfcPattern = /^[a-zA-ZÑñ&]{3,4}\d{2}[0-1]\d[0-3]\d([a-zA-Z,0-9][a-zA-Z,0-9][0-9,a-zA-Z])?$/;
    static curpPattern = /^[A-Z][A,E,I,O,U,X][A-Z]{2}\d{2}[0-1]\d[0-3]\d[M,H][A-Z]{2}[B,C,D,F,G,H,J,K,L,M,N,Ñ,P,Q,R,S,T,V,W,X,Y,Z]{3}[0-9,A-Z]\d$/;
    static cpPattern = /^\d{5}$/;
}

