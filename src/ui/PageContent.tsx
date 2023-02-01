import { useContext, useState, useRef } from "react";
import { saveAs } from "file-saver";
import { RomType } from "rommage";

import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Fade from "@mui/material/Fade";

import HistoryIcon from "@mui/icons-material/History";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

import { RomContext, FileContext } from "../AppData";
import RomOpener from "./RomOpener";
import GbContent from "./content/GbContent";
import GbaContent from "./content/GbaContent";
import NesContent from "./content/NesContent";
import SnesContent from "./content/SnesContent";
import GenericContent from "./content/GenericContent";

interface PageContentProps {
  resetOpened: () => void;
  closeOpened: () => void;
}

export default function PageContent(props: PageContentProps) {
  const romContext = useContext(RomContext);
  const fileContext = useContext(FileContext);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const toggleIsMenuOpen = () => setIsMenuOpen((prevIsOpen) => !prevIsOpen);
  const closeMenu = () => setIsMenuOpen(false);

  let content = null;
  /* Render tab */
  if (fileContext.isOpen) {
    let editorContent = null;
    switch (romContext.rom.type) {
      case RomType.Gb:
        editorContent = <GbContent />;
        break;
      case RomType.Gba:
        editorContent = <GbaContent />;
        break;
      case RomType.Nes:
        editorContent = <NesContent />;
        break;
      case RomType.Snes:
        editorContent = <SnesContent />;
        break;
      case RomType.Generic:
        editorContent = <GenericContent />;
    }

    content = (
      <Fade in={true}>
        <Stack direction="column" spacing={2}>
          <Paper>{editorContent}</Paper>
          <ButtonGroup
            variant={romContext.isModified ? "contained" : "outlined"}
          >
            <Button
              onClick={() => {
                fileContext.getEdited().then((file) => {
                  saveAs(file);
                });
              }}
              sx={{ width: "100%" }}
            >
              Save
            </Button>
            <Button size="small" onClick={toggleIsMenuOpen} ref={menuButtonRef}>
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>
          <Menu
            open={isMenuOpen}
            onClose={() => closeMenu()}
            anchorEl={menuButtonRef.current}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem
              onClick={() => {
                props.resetOpened();
                closeMenu();
              }}
            >
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
              Revert changes
            </MenuItem>
            <MenuItem
              onClick={() => {
                props.closeOpened();
                closeMenu();
              }}
            >
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              Exit ROM
            </MenuItem>
          </Menu>
        </Stack>
      </Fade>
    );
  } else content = <RomOpener />;

  return <FadeScroll>{content}</FadeScroll>;
}

function FadeScroll(props: { children: any }) {
  const theme = useTheme();
  const mSize = theme.spacing(3);
  return (
    <Box
      sx={{
        flex: 1,
        p: 3,
        width: "500px",
        maxWidth: "100vw",
        height: 0,
        overflow: "scroll",
        maskImage: `linear-gradient(to bottom, transparent, black ${mSize}, black calc(100% - ${mSize}), transparent)`,
      }}
    >
      {props.children}
    </Box>
  );
}
