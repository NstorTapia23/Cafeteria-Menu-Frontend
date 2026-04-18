import Image from "next/image";

export default function Home() {
  return (
    <div>
      <Image src="/favicon.ico" alt="Logo" width={120} height={120} priority />
    </div>
  );
}
