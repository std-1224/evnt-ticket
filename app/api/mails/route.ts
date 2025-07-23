import {
  BalanceUpdatedEmailTemplate,
  NewOrderEmailTemplate,
  OrderCancelledEmailTemplate,
  OrderDelayedEmailTemplate,
  OrderDeliveredEmailTemplate,
  ReminderEmailTemplate,
  SignupEmailTemplate,
} from "@/components/EmailTemplate";
import { Resend } from "resend";
import React from "react";
import QRCode from "qrcode";
import { MailType } from "@/lib/types/mail";

const resend = new Resend(process.env.RESEND_API_KEY);

const getSubject = (type: MailType) => {
  switch (type) {
    case "sign_up":
      return " ¡Bienvenido a Payper App!";
    case "new_order":
      return "Pedido Generado";
    default:
      return "Hola";
  }
};

const generateQRCodeImage = async (data: string): Promise<string> => {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    console.log(qrDataUrl);
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};

const getEmailTemplate = async (type: MailType, props: any) => {
  switch (type) {
    case "sign_up":
      return SignupEmailTemplate(props);
    case "new_order":
      // Generate QR code image if qrCode is provided
      if (props.qrCode) {
        const qrImageData = await generateQRCodeImage(props.qrCode);
        return NewOrderEmailTemplate({ ...props, qrImageData });
      }
      return NewOrderEmailTemplate(props);
    case "reminder":
      return ReminderEmailTemplate(props);
    default:
      return SignupEmailTemplate(props);
  }
};

export async function POST(req: Request) {
  const { 
    email, 
    type = "sign_up", 
    orderNumber, 
    balance, 
    qrCode, 
    pickupLocation, 
    totalAmount, 
    items,
    firstName,
    orderUrl
  } = await req.json();
  
  try {
    const { data, error } = await resend.emails.send({
      from: "Merch <hola@payperapp.io>",
      to: [email],
      subject: getSubject(type),
      react: await getEmailTemplate(type, {
        orderNumber,
        balance,
        qrCode,
        pickupLocation,
        totalAmount,
        items,
        firstName,
      }) as React.ReactNode,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
