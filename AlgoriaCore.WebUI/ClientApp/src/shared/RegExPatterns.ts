/* eslint-disable max-len */
export class RegExPatterns {
    static decimalNumberPattern = /^([0-9])*[.]?[0-9]*$/;
    static integerNumberPattern = /^([0-9])*$/;
    static rfcPattern = /^[a-zA-ZÑñ&]{3,4}[0-9]{2}[0-1][0-9][0-3][0-9]([a-zA-Z,0-9][a-zA-Z,0-9][0-9,a-zA-Z])?$/;
    static curpPattern = /^[A-Z][A,E,I,O,U,X][A-Z]{2}[0-9]{2}[0-1][0-9][0-3][0-9][M,H][A-Z]{2}[B,C,D,F,G,H,J,K,L,M,N,Ñ,P,Q,R,S,T,V,W,X,Y,Z]{3}[0-9,A-Z][0-9]$/;
    static cpPattern = /^[0-9]{5}$/;
}

