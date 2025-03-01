import { ToastContainer, toast } from "react-toastify";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import mokeData from "./FAQMokeData";

const FAQ = () => {
  return (
    <>
      <div className="p-8 flex flex-col">
        <div className=" mx-auto py-8">
          <h1 className="text-4xl font-bold text-black">
            Frequently Asked Questions
          </h1>
        </div>
        <Accordion
          type="multiple"
          className="grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1"
        >
          {mokeData?.map((data) => {
            return (
              <AccordionItem
              
                value={data.answer}
                className="p-4 mx-4 shadow-md transform transition duration-500 hover:scale-105 h-auto px-3"
                key={data.id}
              >
                <AccordionTrigger>{data.question}</AccordionTrigger>
                <AccordionContent> {data.answer} </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <div className=" grid w-full gap-2 px-4 my-4">
          <h3 className="text-xl font-semibold text-black my-4 mx-auto">
            Ask questions, gain clarity, and empower your legal journey with us
            ...
          </h3>
          <Textarea placeholder="Type your question here." />
          <Button></Button>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default FAQ;
