'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { MenuOverlay, SheetContent } from './Menu';
import MenuIcon from './Menu.svg';

interface Props {
  children: React.ReactNode;
  direction: 'left' | 'right';
}

export const MobileNavs = ({ children, direction }: Props) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Dialog.Root open={open}>
      <Dialog.Trigger onClick={() => setOpen(true)} className="desktop:hidden">
        <MenuIcon />
      </Dialog.Trigger>
      <Dialog.Portal>
        <MenuOverlay onClick={() => setOpen(false)} />
        <SheetContent
          onEscapeKeyDown={() => setOpen(false)}
          onClick={() => setOpen(false)}
          direction={direction}
        >
          <ul className="flex flex-col gap-8 text-md font-bold leading-tight desktop:gap-16">
            {children}
          </ul>
        </SheetContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
